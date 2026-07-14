import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const metadata = {
  title: 'Toronto Marlies - TML Today',
  description: 'The latest Toronto Marlies news, prospect updates, and AHL coverage from around the Leafs system.',
  alternates: { canonical: '/marlies' },
};

export const dynamic = 'force-dynamic';

export default async function MarliesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { search: 'Marlies', orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Marlies</h1>
        <p className="text-lg text-slate-600">
          Toronto Marlies news, prospect development, and AHL coverage from the Maple Leafs&apos; top affiliate.
        </p>
      </div>

      {feed.articles.length > 0 ? (
        <NewsList articles={feed.articles} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No Toronto Marlies coverage has been collected yet.</p>
      )}

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/marlies" />
    </div>
  );
}
