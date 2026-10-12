import { getDashboardStats } from '@/lib/admin-data';
import { PageHeader, Stat, formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Session"
        title="Account"
        description="Your admin session and the credentials powering the Command Centre."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Signed in as" value="Rick Couchman" />
        <Stat label="Role" value="Administrator" />
        <Stat label="Session length" value="12 hours" hint="Re-authenticates on expiry" />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-brand">Newsroom snapshot</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">Stored items</dt>
            <dd className="mt-1 font-semibold">{stats.total.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">Latest stored update</dt>
            <dd className="mt-1 font-semibold">{formatAdminDate(stats.latestRefresh)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">Refresh schedule</dt>
            <dd className="mt-1 font-semibold">Every 10 minutes</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">Sources represented</dt>
            <dd className="mt-1 font-semibold">{stats.sourcesSeen.toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-brand">Credentials</h3>
        <p className="mt-2 text-sm text-slate-600">
          Admin access is controlled by the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ADMIN_USERNAME</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ADMIN_PASSWORD</code> and <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ADMIN_SESSION_SECRET</code> environment bindings. Rotate them in your Cloudflare project settings to change sign-in.
        </p>
        <form action="/api/admin/logout" method="post" className="mt-5">
          <button className="rounded-md bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-blue-500">Sign out of this session</button>
        </form>
      </section>
    </div>
  );
}
