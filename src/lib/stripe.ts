// Thin Stripe client built on the REST API + fetch. The official `stripe`
// package ships a Node HTTP client that needs a shim on Cloudflare Workers, and
// we only need one endpoint, so we talk to the form-encoded API directly.

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

function getSecretKey(env: Record<string, unknown> | undefined) {
  return String(env?.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? '').trim();
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
