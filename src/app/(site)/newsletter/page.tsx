import Link from 'next/link';
import { getNewsletterEditionDates } from '@/lib/newsletter';

export const metadata = {
  title: 'Newsletter - TML Today',
  description: 'Get Toronto Maple Leafs news, rumours, and highlights delivered to your inbox every morning.',
  alternates: { canonical: '/newsletter' },
};

export const dynamic = 'force-dynamic';

export default async function NewsletterSignupPage() {
  const { editions } = await getNewsletterEditionDates(1);
  const latest = editions[0];

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-brand to-blue-700 p-8 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-amber-300">Free daily newsletter</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Leafs news in your inbox by 7 AM.</h1>
        <p className="mt-3 max-w-xl text-blue-100">
          Every morning, a quick recap of the day's biggest Maple Leafs news, rumours, and highlights from
          across the hockey world &mdash; curated by TML Today.
        </p>

        <form className="mt-6 flex flex-col gap-2 sm:max-w-md sm:flex-row">
          <label htmlFor="newsletter-signup-email" className="sr-only">Email address</label>
          <input
            id="newsletter-signup-email"
            type="email"
            required
            placeholder="you@email.com"
            className="h-11 flex-1 rounded-md border border-white/20 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button type="submit" className="h-11 rounded-md bg-amber-400 px-6 text-sm font-black text-brand transition hover:bg-amber-300">
            Subscribe free
          </button>
        </form>
        <p className="mt-2 text-xs text-blue-100">Free &middot; unsubscribe anytime.</p>
      </div>

      {latest && (
        <div className="rounded-lg border border-slate-300 bg-white p-5 dark:bg-slate-800">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Latest edition</p>
          <Link href={`/newsletter/${latest.date}`} className="mt-1 block text-lg font-semibold text-brand hover:underline">
            See what was in today&apos;s newsletter &rarr;
          </Link>
        </div>
      )}

      <div>
        <Link href="/newsletter/archive" className="text-sm font-bold text-brand hover:underline">
          Browse all past editions &rarr;
        </Link>
      </div>
    </div>
  );
}
