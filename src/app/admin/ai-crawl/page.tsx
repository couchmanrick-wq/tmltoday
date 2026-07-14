import { getCrawlItems, getCrawlStats } from '@/lib/admin-data';
import { CountPill, EmptyState, PageHeader, Stat, formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'bg-emerald-100 text-emerald-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export default async function AiCrawlPage() {
  const [stats, items] = await Promise.all([getCrawlStats(), getCrawlItems(40)]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Enrichment pipeline"
        title="AI Crawl"
        description="The most recent items processed by the AI enrichment pass — summaries, topics, importance and rumour scoring."
        meta={<CountPill>{items.length} recent</CountPill>}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Enriched items" value={stats.enriched} />
        <Stat label="Flagged rumours" value={stats.rumours} />
        <Stat label="Topics detected" value={stats.topics} />
        <Stat label="Avg importance" value={stats.avgImportance == null ? '—' : stats.avgImportance.toFixed(1)} hint={stats.lastCrawl ? `Last crawl ${formatAdminDate(stats.lastCrawl)}` : undefined} />
      </section>

      {items.length === 0 ? (
        <EmptyState>No AI-enriched items are currently stored.</EmptyState>
      ) : (
        <section className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <span>{item.source}</span>
                <span aria-hidden="true">•</span>
                <span>{item.content_type}</span>
                {item.topic && <><span aria-hidden="true">•</span><span>{item.topic}</span></>}
                {Boolean(item.is_rumour) && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">Rumour</span>}
                {item.sentiment && <span className={`rounded px-1.5 py-0.5 ${SENTIMENT_STYLES[item.sentiment] ?? 'bg-slate-100 text-slate-600'}`}>{item.sentiment}</span>}
                {item.importance != null && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">Importance {item.importance}</span>}
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-brand">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.title}</a>
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.ai_summary}</p>
              <p className="mt-3 text-xs text-slate-400">Crawled {formatAdminDate(item.updated_at)}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
