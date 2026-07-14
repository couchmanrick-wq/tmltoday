// Thin Stripe client built on the REST API + fetch. The official `stripe`
// package ships a Node HTTP client that needs a shim on Cloudflare Workers, so
// we talk to the form-encoded API directly.
//
// Stripe is the system of record for donations — nothing is mirrored into D1.
// The admin Donors tab therefore reads live from here, and its edit/cancel
// actions mutate Stripe itself, so what an admin sees is what the donor's card
// sees. There is no local row that can drift out of sync with real billing.

import type { DonationInterval } from '@/lib/donations';

const STRIPE_API = 'https://api.stripe.com/v1';

export type CheckoutSessionInput = {
  amountCents: number;
  interval: DonationInterval;
  successUrl: string;
  cancelUrl: string;
  supporterName?: string;
  note?: string;
};

/** A live monthly supporter, backed by an active Stripe subscription. */
export type MonthlyDonor = {
  id: string;
  itemId: string;
  name: string;
  email: string;
  amountCents: number;
  createdIso: string;
};

/** A completed one-time payment. `refunded` rows stay listed but can't be refunded twice. */
export type OneTimeDonor = {
  id: string;
  paymentIntentId: string;
  name: string;
  email: string;
  amountCents: number;
  createdIso: string;
  refunded: boolean;
};

function getSecretKey(env: Record<string, unknown> | undefined) {
  return String(env?.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? '').trim();
}

/** Raised when Stripe is unreachable or rejects a call, so callers can show the reason. */
export class StripeError extends Error {}

async function stripeRequest<T>(
  env: Record<string, unknown> | undefined,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  const secretKey = getSecretKey(env);
  if (!secretKey) throw new StripeError('STRIPE_SECRET_KEY is not configured.');

  const body = params ? toFormBody(params).toString() : undefined;
  const url = method === 'GET' && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${secretKey}`,
      ...(method === 'GET' ? {} : { 'content-type': 'application/x-www-form-urlencoded' }),
    },
    ...(method === 'GET' ? {} : { body }),
  });

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null;

  if (!res.ok || !data) {
    throw new StripeError(data?.error?.message ?? `Stripe returned HTTP ${res.status}.`);
  }
  return data;
}

/** Whatever name we can find, preferring the one the supporter typed on our form. */
function resolveName(metadataName: unknown, fallbackName: unknown, email: unknown) {
  const candidates = [metadataName, fallbackName, email];
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim();
    if (value) return value;
  }
  return 'Anonymous';
}

function toIso(unixSeconds: unknown) {
  const seconds = Number(unixSeconds);
  return Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : '';
}

/** Stripe's form API takes nested data as bracket keys: line_items[0][quantity]=1 */
function toFormBody(
  params: Record<string, unknown>,
  prefix = '',
  form = new URLSearchParams()
): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object') toFormBody(value as Record<string, unknown>, name, form);
    else form.set(name, String(value));
  }
  return form;
}

/**
 * Create a Stripe Checkout Session and return its hosted payment URL. `monthly`
 * builds a subscription; Stripe then rebills the card, retries failed payments,
 * and hosts the receipt, so no card data ever touches this app.
 */
export async function createDonationCheckoutSession(
  env: Record<string, unknown> | undefined,
  input: CheckoutSessionInput
): Promise<string> {
  const secretKey = getSecretKey(env);
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured.');

  const { amountCents, interval, successUrl, cancelUrl, supporterName, note } = input;
  const monthly = interval === 'monthly';

  const params: Record<string, unknown> = {
    mode: monthly ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'cad',
          unit_amount: amountCents,
          product_data: {
            name: monthly ? 'Monthly support for TML Today' : 'One-time support for TML Today',
          },
          ...(monthly ? { recurring: { interval: 'month' } } : {}),
        },
      },
    ],
    metadata: {
      kind: monthly ? 'monthly_support' : 'one_time_support',
      supporter_name: supporterName || '',
      note: note || '',
    },
    // Session metadata does NOT propagate to the subscription Stripe creates, and
    // the admin Donors tab reads subscriptions (the source of truth for what is
    // actually being billed). Without this, every monthly supporter would show up
    // as "Anonymous".
    ...(monthly
      ? {
          subscription_data: {
            metadata: { supporter_name: supporterName || '', note: note || '' },
          },
        }
      : {}),
  };

  // submit_type relabels the Checkout button to "Donate"; Stripe rejects it on
  // subscription sessions, so it only goes on one-time payments.
  if (!monthly) params.submit_type = 'donate';

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: toFormBody(params).toString(),
  });

  const data = (await res.json().catch(() => null)) as
    | { url?: string; error?: { message?: string } }
    | null;

  if (!res.ok || !data?.url) {
    const detail = data?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Stripe rejected the checkout session: ${detail}`);
  }

  return data.url;
}

/* -------------------------------------------------------------------------- */
/* Admin: reading and mutating donors                                          */
/* -------------------------------------------------------------------------- */

type StripeList<T> = { data: T[] };

type RawSubscription = {
  id: string;
  created: number;
  metadata?: Record<string, string>;
  customer?: { name?: string | null; email?: string | null } | string;
  items: { data: { id: string; price: { unit_amount: number | null; product: string } }[] };
};

type RawSession = {
  id: string;
  created: number;
  mode: string;
  payment_status: string;
  amount_total: number | null;
  metadata?: Record<string, string>;
  customer_details?: { name?: string | null; email?: string | null } | null;
  payment_intent?: { id: string; latest_charge?: { refunded?: boolean } | null } | string | null;
};

/** Active monthly supporters, newest first. */
export async function listMonthlyDonors(
  env: Record<string, unknown> | undefined
): Promise<MonthlyDonor[]> {
  const res = await stripeRequest<StripeList<RawSubscription>>(env, 'GET', '/subscriptions', {
    status: 'active',
    limit: 100,
    'expand[]': 'data.customer',
  });

  return res.data
    .map((sub) => {
      const item = sub.items?.data?.[0];
      const customer = typeof sub.customer === 'object' && sub.customer ? sub.customer : null;
      return {
        id: sub.id,
        itemId: item?.id ?? '',
        name: resolveName(sub.metadata?.supporter_name, customer?.name, customer?.email),
        email: String(customer?.email ?? ''),
        amountCents: item?.price?.unit_amount ?? 0,
        createdIso: toIso(sub.created),
      };
    })
    .sort((a, b) => b.createdIso.localeCompare(a.createdIso));
}

/** Completed one-time donations, newest first. */
export async function listOneTimeDonors(
  env: Record<string, unknown> | undefined
): Promise<OneTimeDonor[]> {
  const res = await stripeRequest<StripeList<RawSession>>(env, 'GET', '/checkout/sessions', {
    limit: 100,
    'expand[]': 'data.payment_intent.latest_charge',
  });

  return res.data
    .filter((session) => session.mode === 'payment' && session.payment_status === 'paid')
    .map((session) => {
      const pi = typeof session.payment_intent === 'object' ? session.payment_intent : null;
      return {
        id: session.id,
        paymentIntentId: pi?.id ?? (typeof session.payment_intent === 'string' ? session.payment_intent : ''),
        name: resolveName(
          session.metadata?.supporter_name,
          session.customer_details?.name,
          session.customer_details?.email
        ),
        email: String(session.customer_details?.email ?? ''),
        amountCents: session.amount_total ?? 0,
        createdIso: toIso(session.created),
        refunded: Boolean(pi?.latest_charge?.refunded),
      };
    })
    .sort((a, b) => b.createdIso.localeCompare(a.createdIso));
}

/** Cancel a monthly subscription immediately. Billing genuinely stops. */
export async function cancelSubscription(env: Record<string, unknown> | undefined, subscriptionId: string) {
  await stripeRequest(env, 'DELETE', `/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

/**
 * Change what a monthly supporter is billed. Stripe prices are immutable, so this
 * mints a new price against the subscription's existing product and swaps the
 * item onto it. proration_behavior=none means the supporter is not surprised by a
 * mid-cycle top-up charge — the new amount simply applies from the next renewal.
 */
export async function updateSubscriptionAmount(
  env: Record<string, unknown> | undefined,
  subscriptionId: string,
  amountCents: number
) {
  const sub = await stripeRequest<RawSubscription>(
    env,
    'GET',
    `/subscriptions/${encodeURIComponent(subscriptionId)}`
  );
  const item = sub.items?.data?.[0];
  if (!item) throw new StripeError('That subscription has no billable item.');

  const price = await stripeRequest<{ id: string }>(env, 'POST', '/prices', {
    currency: 'cad',
    unit_amount: amountCents,
    product: item.price.product,
    recurring: { interval: 'month' },
  });

  await stripeRequest(env, 'POST', `/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    items: [{ id: item.id, price: price.id }],
    proration_behavior: 'none',
  });
}

/** Refund a completed one-time donation in full. */
export async function refundPayment(env: Record<string, unknown> | undefined, paymentIntentId: string) {
  await stripeRequest(env, 'POST', '/refunds', { payment_intent: paymentIntentId });
}
