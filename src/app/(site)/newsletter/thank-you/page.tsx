import Link from 'next/link';

export const metadata = {
  title: 'Confirm Your Subscription - TML Today',
  description: 'One more step to join the TML Today newsletter.',
  robots: { index: false, follow: true },
};

export default function NewsletterThankYouPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <p className="text-xs font-black uppercase tracking-wider text-brand">Almost there</p>
      <h1 className="text-4xl font-bold">Check your inbox</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        We just sent a confirmation email to the address you signed up with. Click the confirmation
        link inside to finish joining TML Today &mdash; you won&apos;t receive the newsletter until
        you confirm.
      </p>

      <div className="rounded-lg border border-slate-300 bg-white p-5 text-left dark:bg-slate-800">
        <p className="font-semibold">Don&apos;t see it?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>Check your spam or promotions folder.</li>
          <li>Add the sender to your contacts so future issues land in your inbox.</li>
          <li>Give it a couple of minutes &mdash; email delivery can lag.</li>
        </ul>
      </div>

      <div className="flex justify-center gap-6 text-sm font-bold">
        <Link href="/newsletter" className="text-brand hover:underline">
          &larr; Back to newsletter signup
        </Link>
        <Link href="/newsletter/archive" className="text-brand hover:underline">
          Browse past editions &rarr;
        </Link>
      </div>
    </div>
  );
}
