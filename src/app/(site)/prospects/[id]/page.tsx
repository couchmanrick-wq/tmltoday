import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerProfile, ProfileSubject } from '@/components/content/PlayerProfile';
import { getArticlesForPlayer } from '@/lib/aggregator/db';
import { CareerStatLine, getProspectProfile } from '@/lib/leafs-prospects';
import { getLeafsSalaries, toSalaryLine } from '@/lib/leafs-salaries';

export const dynamic = 'force-dynamic';

const fmtPct = (v?: number) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''));
const fmtGaa = (v?: number) => (v == null ? '—' : v.toFixed(2));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProspectProfile(Number(id));
  if (!profile) return { title: 'Prospect - TML Today' };

  return {
    title: `${profile.name} - Leafs Prospect - TML Today`,
    description: `Profile, career stats and news for Maple Leafs prospect ${profile.name}.`,
  };
}

export default async function ProspectProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const profile = await getProspectProfile(numericId);
  if (!profile) notFound();

  const [salaries, stories] = await Promise.all([getLeafsSalaries(), getArticlesForPlayer(profile.name)]);
  const salary = salaries.get(profile.id);
  const { isGoalie, career } = profile;
  // `career` is ordered oldest season first, so the headline stat line is the last entry.
  const latest = career[career.length - 1];

  const subject: ProfileSubject = {
    kind: 'Prospect',
    name: profile.name,
    headshot: profile.headshot,
    position: profile.position,
    number: profile.number,
    teamLabel: profile.currentClub
      ? `${profile.currentClub}${profile.currentLeague ? ` (${profile.currentLeague})` : ''}`
      : 'Toronto Maple Leafs system',
    stats: latest ? statCells(latest, isGoalie) : [],
    statsContext: latest ? `${latest.seasonLabel} ${latest.league} regular season` : null,
    salary: salary ? toSalaryLine(salary) : null,
    reference: profile.draft
      ? {
          label: `${profile.draft.year} NHL Draft`,
          href: `https://www.nhl.com/draft/${profile.draft.year}`,
          note: `Round ${profile.draft.round}, #${profile.draft.overall} overall (${profile.draft.team})`,
        }
      : null,
    details: [
      profile.age != null ? `Age ${profile.age}` : null,
      profile.height,
      profile.weight,
      profile.shoots ? `${isGoalie ? 'Catches' : 'Shoots'} ${profile.shoots}` : null,
      `${profile.nhlGamesPlayed} NHL GP`,
    ].filter((detail): detail is string => Boolean(detail)),
  };

  return (
    <div className="space-y-8">
      <Link href="/prospects" className="inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
        &larr; All prospects
      </Link>

      <PlayerProfile subject={subject} stories={stories}>
        <section>
          <h2 className="mb-5 text-2xl font-bold text-brand">
            Career stats <span className="text-base font-normal text-slate-500">(regular season)</span>
          </h2>

          {career.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Season</th>
                    <th className="px-4 py-2 text-left">Team</th>
                    <th className="px-4 py-2 text-left">Lg</th>
                    <th className="px-4 py-2 text-center">GP</th>
                    {isGoalie ? (
                      <>
                        <th className="px-4 py-2 text-center">W</th>
                        <th className="px-4 py-2 text-center">SV%</th>
                        <th className="px-4 py-2 text-center">GAA</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-2 text-center">G</th>
                        <th className="px-4 py-2 text-center">A</th>
                        <th className="px-4 py-2 text-center">P</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {career.map((line, i) => (
                    <tr key={`${line.season}-${line.league}-${line.team}-${i}`} className={line.league === 'NHL' ? 'bg-blue-50/60' : ''}>
                      <td className="px-4 py-2 font-semibold text-slate-700">{line.seasonLabel}</td>
                      <td className="px-4 py-2 text-slate-700">{line.team}</td>
                      <td className="px-4 py-2 font-bold text-slate-500">{line.league}</td>
                      <td className="px-4 py-2 text-center">{line.gamesPlayed}</td>
                      {isGoalie ? (
                        <>
                          <td className="px-4 py-2 text-center">{line.wins ?? '—'}</td>
                          <td className="px-4 py-2 text-center">{fmtPct(line.savePctg)}</td>
                          <td className="px-4 py-2 text-center">{fmtGaa(line.goalsAgainstAvg)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-center">{line.goals ?? '—'}</td>
                          <td className="px-4 py-2 text-center">{line.assists ?? '—'}</td>
                          <td className="px-4 py-2 text-center font-bold text-brand">{line.points ?? '—'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No career stats available.</p>
          )}
        </section>
      </PlayerProfile>
    </div>
  );
}

function statCells(line: CareerStatLine, isGoalie: boolean) {
  if (isGoalie) {
    return [
      { label: 'GP', value: String(line.gamesPlayed) },
      { label: 'W', value: String(line.wins ?? 0) },
      { label: 'SV%', value: fmtPct(line.savePctg) },
      { label: 'GAA', value: fmtGaa(line.goalsAgainstAvg) },
    ];
  }

  return [
    { label: 'GP', value: String(line.gamesPlayed) },
    { label: 'G', value: String(line.goals ?? 0) },
    { label: 'A', value: String(line.assists ?? 0) },
    { label: 'PTS', value: String(line.points ?? 0) },
  ];
}
