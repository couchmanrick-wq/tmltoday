import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const metadata = {
  title: 'Maple Leafs Blogs - TML Today',
  description: 'The latest Toronto Maple Leafs blog posts, opinion, and independent analysis.',
  alternates: { canonical: '/blogs' },
};

export const dynamic = 'force-dynamic';

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { type: 'blog', orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Blogs</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Independent Maple Leafs opinion, analysis, history, and fan perspectives.
        </p>
      </div>

      {feed.articles.length > 0 ? (
        <NewsList articles={feed.articles} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
          No blog posts have been collected yet.
        </p>
      )}

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/blogs" />
    </div>
  );
}
