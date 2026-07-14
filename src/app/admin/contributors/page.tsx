import { getContributors } from '@/lib/admin-data';
import { CountPill, EmptyState, PageHeader, formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function ContributorsPage() {
  const contributors = await getContributors();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bylines"
        title="Contributors"
        description="Writers and creators credited on aggregated items, ranked by how much of the feed they drive."
        meta={<CountPill>{contributors.length} contributors</CountPill>}
      />

      {contributors.length === 0 ? (
        <EmptyState>No bylines have been captured yet.</EmptyState>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Contributor</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Sources</th>
                  <th className="px-5 py-3">Latest byline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributors.map((c) => (
                  <tr key={c.author} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-bold text-brand">{c.author}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">{c.items.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{c.sources.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">{formatAdminDate(c.latest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
