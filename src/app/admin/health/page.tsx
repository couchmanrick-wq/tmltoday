import { headers } from 'next/headers';
import { runSiteHealth, type PageCheck } from '@/lib/site-health';
import { RunChecksButton } from '@/components/admin/RunChecksButton';
import { formatAdminDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

async function resolveBaseUrl() {
  const h = await headers();
  const host = h.get('host') ?? 'tmltoday.couchmanrick.workers.dev';
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

const LEVEL_STYLES: Record<PageCheck['level'], string> = {
  ok: 'text-emerald-700',
  warning: 'text-amber-700',
  problem: 'text-red-700',
};

export default async function HealthPage() {
  const base = await resolveBaseUrl();
  const report = await runSiteHealth(base);

  return (
    <div className="space-y-7">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">Live diagnostics</p>
            <h2 className="mt-1 text-3xl font-black text-brand">Site Health</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Live checks of public pages: HTTP status, response time, titles, descriptions, canonicals, H1 tags, structured data, sitemap and robots.txt.</p>
          </div>
          <RunChecksButton />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard value={`${report.score}/100`} label="Health score" />
          <ScoreCard value={report.healthy} label="Healthy pages" />
          <ScoreCard value={report.warnings} label="Pages with warnings" tone={report.warnings > 0 ? 'warning' : undefined} />
          <ScoreCard value={report.problems} label="Problems" tone={report.problems > 0 ? 'problem' : undefined} />
        </div>

        <div className="mt-6 space-y-1 rounded-lg bg-blue-50 px-5 py-4 text-sm font-bold text-slate-700">
          <p>HTTPS: {report.https ? 'Yes' : 'No'}</p>
          <p>Sitemap: {report.sitemap.detail}</p>
          <p>robots.txt: {report.robots.detail}</p>
          <p>Last scan: {formatAdminDate(report.lastScan)}</p>
        </div>

        <div className="mt-5 rounded-lg bg-amber-50 px-5 py-4">
          <p className="text-sm font-bold text-slate-700">Recommendations (highest impact first)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700 marker:font-bold marker:text-blue-600">
            {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ol>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Page</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Load</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">H1</th>
                <th className="px-5 py-3">Schema</th>
                <th className="px-5 py-3">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.pages.map((page) => (
                <tr key={page.path} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-bold text-brand">{page.path}</td>
                  <td className={`px-5 py-4 text-sm font-bold ${page.status && page.status < 400 ? 'text-emerald-700' : 'text-red-700'}`}>{page.status ?? 'ERR'}</td>
                  <td className="px-5 py-4 text-sm text-blue-700">{page.loadMs == null ? '—' : `${(page.loadMs / 1000).toFixed(2)}s`}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{page.title ? 'Yes' : 'No'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{page.h1Count}</td>
                  <td className={`px-5 py-4 text-sm font-semibold ${page.hasSchema ? 'text-emerald-700' : 'text-slate-400'}`}>{page.hasSchema ? 'Yes' : 'No'}</td>
                  <td className={`px-5 py-4 text-sm font-semibold ${LEVEL_STYLES[page.level]}`}>{page.issues.length === 0 ? 'OK' : page.issues.join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ScoreCard({ value, label, tone }: { value: string | number; label: string; tone?: 'warning' | 'problem' }) {
  const valueColor = tone === 'problem' ? 'text-red-700' : tone === 'warning' ? 'text-amber-700' : 'text-brand';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`text-4xl font-black ${valueColor}`}>{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
