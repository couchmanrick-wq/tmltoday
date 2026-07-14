import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const metadata = {
  title: 'News - TML Today',
  description: 'The latest Toronto Maple Leafs news from across the hockey world.',
  alternates: { canonical: '/news' },
};

export const dynamic = 'force-dynamic';

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page),
    FALLBACK_ARTICLES
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">News</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The latest Toronto Maple Leafs news from across the hockey world.
        </p>
      </div>

      <NewsList articles={feed.articles} />

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/news" />
    </div>
  );
}
