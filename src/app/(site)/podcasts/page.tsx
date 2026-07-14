import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/podcasts' } };

export default async function PodcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { type: 'podcast', orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Podcasts</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The latest Maple Leafs podcasts and audio analysis from across the hockey world.
        </p>
      </div>

      {feed.articles.length > 0 ? (
        <NewsList articles={feed.articles} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No podcast episodes have been collected yet.</p>
      )}

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/podcasts" />
    </div>
  );
}
