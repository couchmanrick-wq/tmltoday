import { AGGREGATOR_SOURCES } from '@/lib/aggregator/sources';
import { getDashboardStats } from '@/lib/admin-data';
import { PageHeader, Stat } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const stats = await getDashboardStats();
  const configuredFeeds = AGGREGATOR_SOURCES.filter((source) => source.feedUrl).length;
  const sourceGroups = [
    { label: 'Articles', type: 'article' as const },
    { label: 'Blogs', type: 'blog' as const },
    { label: 'Podcasts', type: 'podcast' as const },
    { label: 'Videos', type: 'video' as const },
  ].map((group) => ({ ...group, sources: AGGREGATOR_SOURCES.filter((source) => source.contentType === group.type) }));

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Newsroom overview" title="Sources" description="Every feed and scrape target powering the aggregator, grouped by the content they produce." />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Stored items" value={stats.total} />
        <Stat label="Configured sources" value={AGGREGATOR_SOURCES.length} />
        <Stat label="Direct feeds" value={configuredFeeds} />
        <Stat label="Sources represented" value={stats.sourcesSeen} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Articles" value={stats.articles} />
        <Stat label="Blogs" value={stats.blogs} />
        <Stat label="Podcasts" value={stats.podcasts} />
        <Stat label="Videos" value={stats.videos} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-brand">Source catalog</h3>
          <span className="text-sm text-slate-500">{AGGREGATOR_SOURCES.length} sources</span>
        </div>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
          {sourceGroups.map((group) => (
            <article key={group.type} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h4 className="text-xl font-bold text-brand">{group.label}</h4>
                <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">{group.sources.length} sources</span>
              </header>
              <div className="max-h-[520px] divide-y divide-slate-200 overflow-auto px-5">
                {group.sources.map((source) => (
                  <div key={source.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_120px_70px] sm:items-center">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">{source.name}</a>
                    <span className="text-sm capitalize text-slate-600">{source.kind.replace('-', ' ')}</span>
                    <span className={`text-xs font-bold uppercase ${source.feedUrl ? 'text-green-700' : 'text-amber-700'}`}>{source.feedUrl ? 'Feed' : 'Scrape'}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
