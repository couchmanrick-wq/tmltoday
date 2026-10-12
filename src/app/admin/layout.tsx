import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { LoginPage } from '@/components/admin/LoginPage';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!session) return <LoginPage />;

  const readOnly = session.role === 'viewer';

  return (
    <main className={`${readOnly ? 'admin-read-only ' : ''}min-h-screen bg-[#f9f8fc] px-4 py-[18px] text-slate-900 sm:px-6 lg:px-11`}>
      {readOnly && <style>{`.admin-read-only [data-admin-write="true"] { display: none !important; }`}</style>}
      <div className="mx-auto max-w-[1320px] space-y-7">
        <header className="overflow-hidden rounded-[14px] border border-slate-300 bg-white">
          <div className="flex min-h-[176px] flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-[#06245d] via-[#1f397f] to-[#6432f3] px-8 py-7 sm:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffbf28]">TML Today</p>
              <Link href="/admin" className="mt-3 inline-block text-[42px] font-black leading-none tracking-[-0.035em] text-white transition hover:text-blue-100 sm:text-[54px]">
                Command Centre
              </Link>
              <p className="mt-4 text-base text-blue-100">
                Welcome back, {session.username}. {readOnly ? 'You have read-only access to the Command Centre.' : 'Manage the newsroom and aggregated feed from one place.'}
              </p>
            </div>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-[7px] border border-white/30 bg-white/5 px-[18px] py-[10px] text-sm font-bold text-white transition hover:bg-white/15">Sign out</button>
            </form>
          </div>
          <AdminNav />
        </header>

        {readOnly && (
          <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">
            Read-only guest session: you can view every admin section, but editing actions are disabled.
          </p>
        )}

        {children}
      </div>
    </main>
  );
}
