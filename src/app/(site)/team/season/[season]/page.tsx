import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeafsSeason, HistoricalPlayer, seasonIdToLabel, seasonSlugToId } from '@/lib/nhl-history';

export const revalidate = 86400;

export default async function HistoricalSeasonPage({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const seasonId = seasonSlugToId(season);
  if (!seasonId || seasonId < 19171918 || seasonId > 20252026) notFound();
  const data = await getLeafsSeason(seasonId);
  if (!data) notFound();
  const { record } = data;

  return <div className="space-y-10">
    <div><Link href="/team#season-archive" className="text-sm font-bold text-blue-600 hover:text-blue-800">← All seasons</Link><p className="mt-5 text-xs font-bold uppercase tracking-widest text-pink-500">Toronto Maple Leafs history</p><h1 className="text-4xl font-black text-brand">{seasonIdToLabel(seasonId)} season</h1></div>

    <section className="grid gap-4 sm:grid-cols-4">
      <Metric label="Record" value={`${record.wins}-${record.losses}${record.ties ? `-${record.ties}` : record.otLosses ? `-${record.otLosses}` : ''}`} />
      <Metric label="Games played" value={record.gamesPlayed} />
      <Metric label="Points" value={record.points} />
      <Metric label="Goals" value={`${record.goalsFor}–${record.goalsAgainst}`} />
    </section>

    <RosterSection title="Forwards" players={data.forwards} />
    <RosterSection title="Defencemen" players={data.defensemen} />
    <RosterSection title="Goaltenders" players={data.goalies} />

    <a href={`https://api-web.nhle.com/v1/roster/TOR/${seasonId}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-blue-600 hover:text-blue-800">Source: NHL historical roster →</a>
  </div>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-lg bg-brand p-5 text-white"><p className="text-xs font-bold uppercase text-blue-200">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>; }

function RosterSection({ title, players }: { title: string; players: HistoricalPlayer[] }) {
  return <section><h3 className="mb-4 text-2xl font-bold text-brand">{title}</h3><div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Player</th><th className="px-4 py-3 text-right">Position</th><th className="px-4 py-3 text-right">Shoots</th></tr></thead><tbody className="divide-y divide-slate-200">{players.map((player) => <tr key={player.id}><td className="px-4 py-3 text-slate-500">{player.number ?? '—'}</td><td className="px-4 py-3 font-bold text-brand">{player.name}</td><td className="px-4 py-3 text-right">{player.position}</td><td className="px-4 py-3 text-right">{player.shoots ?? '—'}</td></tr>)}</tbody></table></div></section>;
}
