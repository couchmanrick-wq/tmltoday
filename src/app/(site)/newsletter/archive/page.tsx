import Link from 'next/link';
import { Pagination } from '@/components/content/Pagination';
import { getNewsletterEditionDates } from '@/lib/newsletter';
import { parsePageParam } from '@/lib/pagination';

export const metadata = {
  title: 'Newsletter Archive - TML Today',
  description: 'Every past edition of the TML Today daily newsletter.',
  alternates: { canonical: '/newsletter/archive' },
};

export const dynamic = 'force-dynamic';

function formatEditionDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function NewsletterArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const { editions, page: currentPage, pageCount } = await getNewsletterEditionDates(parsePageParam(page));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Newsletter Archive</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Every past edition of the TML Today daily newsletter.
        </p>
      </div>

      {editions.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No editions have gone out yet &mdash; check back soon.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-300 bg-white dark:divide-slate-700 dark:bg-slate-800">
          {editions.map((edition) => (
            <li key={edition.date}>
              <Link
                href={`/newsletter/${edition.date}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-blue-50 dark:hover:bg-slate-700"
              >
                <span className="font-semibold">{formatEditionDate(edition.date)}</span>
                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  {edition.count} {edition.count === 1 ? 'story' : 'stories'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={currentPage} pageCount={pageCount} basePath="/newsletter/archive" />
    </div>
  );
}
