import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/videos' } };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { type: 'video', orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Videos</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Watch the latest Maple Leafs highlights, interviews, shows, and analysis.
        </p>
      </div>

      {feed.articles.length > 0 ? (
        <NewsList articles={feed.articles} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No videos have been collected yet.</p>
      )}

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/videos" />
    </div>
  );
}
