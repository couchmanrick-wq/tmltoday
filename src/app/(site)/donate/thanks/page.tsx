import Link from 'next/link';

import { formatAmount, isDonationInterval, parseAmountCents } from '@/lib/donations';

export const metadata = {
  title: 'Thank You | TML Today',
  description: 'Thanks for supporting TML Today.',
  // A post-checkout confirmation has no business in search results.
  robots: { index: false, follow: false },
};

export default async function DonateThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; interval?: string }>;
}) {
  const { amount, interval } = await searchParams;

  // Stripe bounces the browser back here with the amount we sent it. It is only
  // ever used for the confirmation copy — the real record of the payment is the
  // Stripe dashboard — so re-validate it and quietly fall back to generic wording.
  const amountCents = parseAmountCents(amount);
  const monthly = isDonationInterval(interval) && interval === 'monthly';
  const amountLabel = amountCents ? `${formatAmount(amountCents)}${monthly ? ' a month' : ''}` : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-blue-400">Payment complete</p>
      <h1 className="text-4xl font-bold">Thank You!</h1>

      <p className="text-lg leading-relaxed text-slate-600">
        {amountLabel
          ? `Your ${amountLabel} goes straight into keeping TML Today running.`
          : 'Your support goes straight into keeping TML Today running.'}{' '}
        Stripe has emailed you a receipt.
      </p>

      {monthly && (
        <p className="text-sm leading-relaxed text-slate-500">
          You&apos;re now a monthly supporter. To change or cancel it, just reply to your Stripe
          receipt or get in touch — no hoops.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-6 py-3 font-heading font-bold text-white transition hover:bg-blue-500"
        >
          Back to the Latest
        </Link>
        <Link
          href="/news"
          className="rounded-lg border-2 border-slate-200 px-6 py-3 font-heading font-bold text-blue-600 transition hover:border-blue-400"
        >
          Read the News
        </Link>
      </div>
    </div>
  );
}
