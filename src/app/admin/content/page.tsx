import Link from 'next/link';
import { getContentItem, getContentPage } from '@/lib/admin-data';
import { EditItemForm, formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const PER_PAGE = 50;

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ page?: string; edit?: string; notice?: string }> }) {
  const { page: pageParam, edit, notice } = await searchParams;
  const requested = Number.parseInt(pageParam ?? '1', 10);
  const { items, total, page, pages } = await getContentPage(Number.isFinite(requested) ? requested : 1, PER_PAGE);
  const editing = edit ? await getContentItem(edit) : null;

  return (
    <div className="space-y-6">
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</p>}

      {editing && (
        <section className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-brand">Editing item</h2>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{editing.content_type}</span>
          </div>
          <EditItemForm item={editing} page={page} />
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500"><span className="font-black text-brand">{total.toLocaleString()}</span> aggregated items, newest first</p>
          <p className="text-sm text-slate-500">Page {page} of {pages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Coverage</th>
                <th className="px-5 py-3">Published</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-bold leading-snug text-brand hover:underline">{item.title}</a>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {item.content_type}{(item.category || item.topic) ? ` · ${item.category ?? item.topic}` : ''}
                      {item.reviewed && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">Reviewed</span>}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-blue-700">{item.source}</td>
                  <td className="px-5 py-4 text-sm font-semibold capitalize text-blue-700">{item.topic ?? '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatAdminDate(item.published_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/content?page=${page}&edit=${item.id}`} className="text-sm font-bold text-blue-700 hover:underline">Edit</Link>
                        <form action="/api/admin/content" method="post">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="page" value={page} />
                          <button name="intent" value="delete" className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-800">Delete</button>
                        </form>
                      </div>
                      <form action="/api/admin/content" method="post">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="page" value={page} />
                        <button name="intent" value={item.reviewed ? 'unconfirm' : 'confirm'} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand">
                          <span aria-hidden="true" className={`flex size-4 items-center justify-center rounded border text-[10px] ${item.reviewed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400 text-transparent'}`}>✓</span>
                          {item.reviewed ? 'Confirmed' : 'Confirm'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">No aggregated content is currently stored.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <PageLink page={page - 1} disabled={page <= 1} label="← Previous" />
          <span className="text-sm text-slate-500">Page {page} of {pages}</span>
          <PageLink page={page + 1} disabled={page >= pages} label="Next →" />
        </div>
      </section>
    </div>
  );
}

function PageLink({ page, disabled, label }: { page: number; disabled: boolean; label: string }) {
  if (disabled) {
    return <span className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-300">{label}</span>;
  }
  return <Link href={`/admin/content?page=${page}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-brand hover:bg-slate-50">{label}</Link>;
}
