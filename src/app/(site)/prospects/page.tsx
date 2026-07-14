import Link from 'next/link';
import { NewsList } from '@/components/content/NewsCard';
import { getEnrichedArticles } from '@/lib/aggregator/db';
import { getStoredProspects } from '@/lib/leafs-prospects';
import type { NewsArticle } from '@/types';

export const metadata = {
  title: 'Maple Leafs Prospects - TML Today',
  description: 'News and updates on Toronto Maple Leafs prospects — drafted, signed and traded young players in the system.',
  alternates: { canonical: '/prospects' },
};

export const dynamic = 'force-dynamic';

function matchesProspect(article: NewsArticle, names: { full: string; parts: string[] }[]) {
  const haystack = `${article.title} ${article.description}`.toLowerCase();
  const tagged = (article.players ?? []).map((p) => p.toLowerCase());
  return names.some(({ full, parts }) =>
    tagged.some((t) => t === full || parts.every((part) => t.includes(part))) || haystack.includes(full),
  );
}

export default async function ProspectsPage() {
  const [prospects, articles] = await Promise.all([
    getStoredProspects(),
    getEnrichedArticles({ limit: 200, orderBy: 'published' }),
  ]);

  const names = prospects.map((p) => ({ full: p.name.toLowerCase(), parts: p.name.toLowerCase().split(/\s+/).filter(Boolean) }));
  const stories = articles.filter((a) => !a.duplicateOf && matchesProspect(a, names));

  return <div className="space-y-10">
    <div>
      <h1 className="mb-2 text-4xl font-bold">Prospects</h1>
      <p className="text-lg text-slate-600">News on Maple Leafs prospects — drafted, signed and traded young players (under 23, not yet NHL regulars). Full stats and the monitored list live on the <Link href="/team" className="font-bold text-blue-600 hover:text-blue-800">Team page</Link>.</p>
    </div>

    {prospects.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {prospects.map((p) => (
          <Link key={p.id} href={`/prospects/${p.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-brand shadow-sm transition hover:border-blue-400 hover:text-blue-600">
            {p.name}
            <span className="ml-1.5 font-normal text-slate-500">{p.currentLeague ?? p.position}</span>
          </Link>
        ))}
      </div>
    )}

    {stories.length > 0 ? <NewsList articles={stories} /> : <section className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No prospect-specific stories have been aggregated yet. Check the <Link href="/team" className="font-bold text-blue-600 hover:text-blue-800">Team page</Link> for the current prospect list and their stats.</section>}
  </div>;
}
