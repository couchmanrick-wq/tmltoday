import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-auth';
import { formatAmount, parseAmountCents } from '@/lib/donations';
import { StripeError, cancelSubscription, refundPayment, updateSubscriptionAmount } from '@/lib/stripe';

/**
 * Every action here mutates Stripe, not a local table — cancelling really stops
 * the billing, refunding really returns the money. There is no "hide the row"
 * path on purpose: a donor who disappears from this screen while their card is
 * still being charged is the worst outcome this feature could produce.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL('/admin', request.url), 303);
  }

  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = String(form.get('id') ?? '').trim().slice(0, 200);

  if (!id) return redirectWithNotice(request, 'That donation is missing an ID.');

  const { env } = getCloudflareContext();
  const stripeEnv = env as unknown as Record<string, unknown>;

  try {
    if (intent === 'cancel') {
      await cancelSubscription(stripeEnv, id);
      return redirectWithNotice(request, 'Monthly support cancelled. The card will not be charged again.');
    }

    if (intent === 'refund') {
      await refundPayment(stripeEnv, id);
      return redirectWithNotice(request, 'Donation refunded in full.');
    }

    if (intent === 'update-amount') {
      const amountCents = parseAmountCents(Math.round(Number(form.get('amount')) * 100));
      if (amountCents === null) {
        return redirectWithNotice(request, 'Enter an amount between $2 and $5,000.');
      }
      await updateSubscriptionAmount(stripeEnv, id, amountCents);
      return redirectWithNotice(
        request,
        `Monthly amount updated to ${formatAmount(amountCents)}. It applies from the next renewal.`
      );
    }

    return redirectWithNotice(request, 'Unknown action.');
  } catch (error) {
    console.error(`Donor action "${intent}" failed for ${id}`, error);
    const reason = error instanceof StripeError ? error.message : 'Stripe could not complete that action.';
    return redirectWithNotice(request, `Failed: ${reason}`);
  }
}

function redirectWithNotice(request: NextRequest, notice: string) {
  const url = new URL('/admin/donors', request.url);
  url.searchParams.set('notice', notice);
  return NextResponse.redirect(url, 303);
}
