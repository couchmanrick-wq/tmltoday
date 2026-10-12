import Link from 'next/link';
import type { AdminContentItem } from '@/lib/admin-data';

const CONTENT_TYPES = ['article', 'blog', 'podcast', 'video', 'tweet'];
const TOPICS = ['breaking', 'game', 'injury', 'trade', 'rumour', 'analysis', 'prospects', 'roster', 'media', 'community'];

export function formatAdminDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Toronto' }).format(new Date(value));
}

export function PageHeader({ eyebrow, title, description, meta }: { eyebrow: string; title: string; description: string; meta?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-black text-brand">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
      {meta && <div className="shrink-0">{meta}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-brand">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function CountPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">{children}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">{children}</div>;
}

export function EditItemForm({ item, page }: { item: AdminContentItem; page?: number }) {
  return (
    <form action="/api/admin/content" method="post" className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <input type="hidden" name="id" value={item.id} />
      {page != null && <input type="hidden" name="page" value={page} />}
      <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Title
        <input name="title" defaultValue={item.title} required maxLength={500} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none focus:ring-2 focus:ring-blue-200" />
      </label>
      <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Description
        <textarea name="description" defaultValue={item.description} rows={3} maxLength={4000} className="mt-1 block w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal outline-none focus:ring-2 focus:ring-blue-200" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Source
          <input name="source" defaultValue={item.source} required maxLength={200} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal" />
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Content type
          <select name="contentType" defaultValue={item.content_type} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal">
            {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Topic
          <select name="topic" defaultValue={item.topic ?? ''} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal">
            <option value="">Uncategorized</option>
            {TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/content" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</Link>
        <div className="flex flex-wrap gap-3">
          <button name="intent" value="delete" formNoValidate className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Delete as unrelated</button>
          <button name="intent" value="update" className="rounded-md bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-blue-500">Save changes</button>
        </div>
      </div>
    </form>
  );
}
