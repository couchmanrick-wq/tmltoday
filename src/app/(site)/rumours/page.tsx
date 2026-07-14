import { NewsList } from '@/components/content/NewsCard';
import { Pagination } from '@/components/content/Pagination';
import { getArticlePage, parsePageParam } from '@/lib/pagination';

export const metadata = {
  title: 'Maple Leafs Rumours - TML Today',
  description: 'The latest Toronto Maple Leafs trade rumours and roster speculation from hockey sources.',
  alternates: { canonical: '/rumours' },
};

export const dynamic = 'force-dynamic';

export default async function RumoursPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { rumours: true, orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Rumours</h1>
        <p className="text-lg text-slate-600">
          Maple Leafs trade chatter, insider reports, and roster speculation. Unconfirmed reports remain rumours until officially announced.
        </p>
      </div>

      {feed.articles.length > 0 ? (
        <NewsList articles={feed.articles} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No current Maple Leafs rumours have been collected.</p>
      )}

      <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/rumours" />
    </div>
  );
}
