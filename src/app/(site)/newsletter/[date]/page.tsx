import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsList } from '@/components/content/NewsCard';
import { getNewsletterEdition } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatEditionDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) return {};

  return {
    title: `${formatEditionDate(date)} Newsletter - TML Today`,
    description: `The TML Today newsletter for ${formatEditionDate(date)}: the day's top Maple Leafs news, rumours, and highlights.`,
    alternates: { canonical: `/newsletter/${date}` },
  };
}

export default async function NewsletterEditionPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) notFound();

  const { articles, total } = await getNewsletterEdition(date);
  if (total === 0) notFound();

  const [topStory, ...rest] = articles;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-black uppercase tracking-wider text-brand">Newsletter edition</p>
        <h1 className="mt-1 text-4xl font-bold">{formatEditionDate(date)}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          {total} {total === 1 ? 'story' : 'stories'} from around the Leafs world.
        </p>
      </div>

      {topStory && (
        <Link
          href={`/story/${topStory.id}`}
          className="group block overflow-hidden rounded-xl bg-gradient-to-br from-brand to-blue-700 p-6 text-white shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-black uppercase tracking-wider text-amber-300">Top story</p>
          <h2 className="mt-2 text-2xl font-bold leading-snug group-hover:underline">{topStory.title}</h2>
          <p className="mt-2 text-blue-100">{topStory.description}</p>
        </Link>
      )}

      {rest.length > 0 && <NewsList articles={rest} />}

      <div className="flex justify-between border-t border-slate-300 pt-6 text-sm font-bold">
        <Link href="/newsletter/archive" className="text-brand hover:underline">
          &larr; All editions
        </Link>
        <Link href="/newsletter" className="text-brand hover:underline">
          Subscribe to get this daily &rarr;
        </Link>
      </div>
    </div>
  );
}
