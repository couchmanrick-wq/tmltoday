import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { formatAmount, isDonationInterval, parseAmountCents } from '@/lib/donations';
import { createDonationCheckoutSession } from '@/lib/stripe';

const FALLBACK_ORIGIN = 'https://tmltoday.com';

/** Hosts we will hand to Stripe as a post-checkout redirect target. */
const ALLOWED_HOSTS = [/^tmltoday\.com$/, /^www\.tmltoday\.com$/, /\.workers\.dev$/, /^localhost$/, /^127\.0\.0\.1$/];

type DonateBody = {
  amountCents?: unknown;
  interval?: unknown;
  supporterName?: unknown;
  note?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? '').trim().slice(0, maxLength);
}

/**
 * Stripe redirects the browser to these URLs after checkout, so an attacker-set
 * Host must never end up in them. The site is served from both tmltoday.com and
 * the workers.dev preview domain, so match the request origin against a fixed
 * allowlist rather than trusting it or hard-coding a single domain.
 */
function resolveOrigin(req: NextRequest) {
  const url = new URL(req.url);
  return ALLOWED_HOSTS.some((host) => host.test(url.hostname)) ? url.origin : FALLBACK_ORIGIN;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as DonateBody | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const interval = body.interval;
  if (!isDonationInterval(interval)) {
    return NextResponse.json({ ok: false, error: 'Choose a one-time or monthly amount.' }, { status: 422 });
  }

  const amountCents = parseAmountCents(body.amountCents);
  if (amountCents === null) {
    return NextResponse.json(
      { ok: false, error: 'Please enter an amount between $2 and $5,000.' },
      { status: 422 }
    );
  }

  const origin = resolveOrigin(req);

  try {
    const { env } = getCloudflareContext();

    const url = await createDonationCheckoutSession(env as unknown as Record<string, unknown>, {
      amountCents,
      interval,
      supporterName: clean(body.supporterName, 120),
      note: clean(body.note, 400),
      successUrl: `${origin}/donate/thanks?amount=${amountCents}&interval=${interval}`,
      cancelUrl: `${origin}/donate?cancelled=1`,
    });

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error(`Donation checkout failed (${formatAmount(amountCents)} ${interval})`, error);
    return NextResponse.json(
      { ok: false, error: 'Could not start checkout right now. Please try again shortly.' },
      { status: 502 }
    );
  }
}
