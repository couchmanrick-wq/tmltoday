import Link from 'next/link';
import { getContentByType } from '@/lib/admin-data';
import { CountPill, EmptyState, PageHeader, formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function ColumnsPage() {
  const columns = await getContentByType('blog', 50);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Opinion & analysis"
        title="Columns"
        description="Long-form blog and column content pulled into the feed. Review the framing and clean up anything off-topic."
        meta={<CountPill>{columns.length} columns</CountPill>}
      />

      {columns.length === 0 ? (
        <EmptyState>No column or blog content is currently stored.</EmptyState>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Column</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Coverage</th>
                  <th className="px-5 py-3">Published</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {columns.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/60">
                    <td className="max-w-md px-5 py-4">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-bold leading-snug text-brand hover:underline">{item.title}</a>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description || 'No description provided.'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-blue-700">{item.source}</td>
                    <td className="px-5 py-4 text-sm font-semibold capitalize text-blue-700">{item.topic ?? '—'}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatAdminDate(item.published_at)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/content?edit=${item.id}`} className="text-sm font-bold text-blue-700 hover:underline">Edit</Link>
                    </td>
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
