import { NewsGrid, NewsList } from '@/components/content/NewsCard';
import { getEnrichedArticles } from '@/lib/aggregator/db';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';

export const metadata = {
  title: 'News - TML Today',
  description: 'The latest Toronto Maple Leafs news from across the hockey world.',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const articles = await getEnrichedArticles({ limit: 60 });
  const news = articles.length > 0 ? articles : FALLBACK_ARTICLES;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">News</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The latest Toronto Maple Leafs news from across the hockey world.
        </p>
      </div>

      {/* Top stories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Top Stories</h2>
        <NewsGrid articles={news.slice(0, 3)} cols={3} />
      </section>

      {/* Everything else */}
      <section>
        <h2 className="text-2xl font-bold mb-6">More News</h2>
        <NewsList articles={news.slice(3)} />
      </section>
    </div>
  );
}
