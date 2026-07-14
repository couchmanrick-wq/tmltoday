import Link from 'next/link';
import { TORONTO_MAPLE_LEAFS } from '@/data/teams';
import { getAtlanticStandings, NHL_STANDINGS_SOURCE_URL } from '@/lib/nhl-standings';
import { getLeafsSeasonIds, seasonIdToLabel, seasonIdToSlug } from '@/lib/nhl-history';
import { getLeafsRoster, getStoredProspects, seasonLabel, PROSPECT_AGE_LIMIT, PROSPECT_GP_LIMIT, type RosterPlayer, type LeafProspect } from '@/lib/leafs-prospects';
import { getStoredDraftPicks, type DraftYear } from '@/lib/leafs-draft';

export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/team' } };

const POSITION_ORDER: Record<string, number> = { C: 0, L: 1, R: 2, D: 3, G: 4 };
const fmtPct = (v?: number) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''));
const fmtGaa = (v?: number) => (v == null ? '—' : v.toFixed(2));

const CUP_YEARS = [1918, 1922, 1932, 1942, 1945, 1947, 1948, 1949, 1951, 1962, 1963, 1964, 1967];

const HISTORY = [
  { year: '1917', title: 'The franchise begins', text: 'Toronto joins the new NHL, initially playing as Toronto and later becoming known as the Arenas.' },
  { year: '1919', title: 'Toronto St. Patricks', text: 'New ownership renames the club the Toronto St. Patricks and adopts green and white.' },
  { year: '1927', title: 'The Maple Leafs', text: 'Conn Smythe purchases the team and introduces the Toronto Maple Leafs name and blue-and-white identity.' },
  { year: '1931', title: 'Maple Leaf Gardens opens', text: 'The Leafs move into one of hockey’s most famous arenas, their home for nearly 68 years.' },
  { year: '1940s', title: 'The first dynasty', text: 'Toronto wins five Stanley Cups during the decade, including three consecutive championships from 1947–49.' },
  { year: '1962–64', title: 'Three straight Cups', text: 'The Leafs capture three consecutive championships under coach Punch Imlach.' },
  { year: '1967', title: 'The thirteenth Cup', text: 'Toronto defeats Montreal in six games for its most recent Stanley Cup championship.' },
  { year: '1999', title: 'A new downtown home', text: 'The club leaves Maple Leaf Gardens and moves to the arena now known as Scotiabank Arena.' },
];

const RETIRED_NUMBERS = [
  ['1', 'Turk Broda, Johnny Bower'], ['4', 'Hap Day, Red Kelly'], ['5', 'Bill Barilko'],
  ['6', 'Ace Bailey'], ['7', 'King Clancy, Tim Horton'], ['9', 'Charlie Conacher, Ted Kennedy'],
  ['10', 'Syl Apps, George Armstrong'], ['13', 'Mats Sundin'], ['14', 'Dave Keon'],
  ['17', 'Wendel Clark'], ['21', 'Börje Salming'], ['27', 'Frank Mahovlich, Darryl Sittler'],
  ['93', 'Doug Gilmour'],
];

const TOP_TEN = ['Dave Keon', 'Syl Apps', 'Ted Kennedy', 'Darryl Sittler', 'Mats Sundin', 'Tim Horton', 'Johnny Bower', 'Börje Salming', 'Frank Mahovlich', 'Turk Broda'];

export default async function TeamPage() {
  const [standings, seasonIds, roster, prospects, draftYears] = await Promise.all([
    getAtlanticStandings(),
    getLeafsSeasonIds(),
    getLeafsRoster(),
    getStoredProspects(),
    getStoredDraftPicks(),
  ]);
  const leafs = standings.find((team) => team.abbreviation === 'TOR');
  const rosterPlayers = [...roster.players].sort(
    (a, b) => (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9) || (a.number ?? 999) - (b.number ?? 999),
  );

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-xl bg-gradient-to-br from-brand to-blue-700 text-white shadow-lg">
        <div className="p-7 sm:p-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Team hub</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{TORONTO_MAPLE_LEAFS.name}</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Toronto, Ontario · Atlantic Division · Established 1917</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TeamMetric label="2025–26 record" value={leafs ? `${leafs.wins}-${leafs.losses}-${leafs.otl}` : '—'} />
            <TeamMetric label="2025–26 points" value={String(leafs?.points ?? '—')} />
            <TeamMetric label="Stanley Cups" value="13" />
            <TeamMetric label="Home" value="Scotiabank Arena" small />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">2025–26 final</p><h2 className="text-3xl font-bold text-brand">Atlantic Division standings</h2></div>
          <a href={NHL_STANDINGS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800">Official NHL source →</a>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Team</th><th className="px-4 py-3 text-center">GP</th><th className="px-4 py-3 text-center">W</th><th className="px-4 py-3 text-center">L</th><th className="px-4 py-3 text-center">OTL</th><th className="px-4 py-3 text-center">PTS</th></tr></thead>
            <tbody className="divide-y divide-slate-200">
              {standings.map((row) => <tr key={row.abbreviation} className={row.abbreviation === 'TOR' ? 'bg-blue-50' : ''}><td className="px-4 py-3 font-bold">{row.rank}</td><td className="px-4 py-3 font-bold text-brand">{row.team}</td><td className="px-4 py-3 text-center">{row.gp}</td><td className="px-4 py-3 text-center">{row.wins}</td><td className="px-4 py-3 text-center">{row.losses}</td><td className="px-4 py-3 text-center">{row.otl}</td><td className="px-4 py-3 text-center font-bold text-blue-600">{row.points}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">{seasonLabel(roster.season)}</p><h2 className="text-3xl font-bold text-brand">Current roster</h2></div>
          <span className="text-sm font-bold text-slate-500">{rosterPlayers.length} players</span>
        </div>
        {rosterPlayers.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Player</th><th className="px-4 py-3 text-center">Pos</th><th className="px-4 py-3 text-center">Age</th><th className="px-4 py-3 text-center">GP</th><th className="px-4 py-3 text-left">Ht</th><th className="px-4 py-3 text-left">Wt</th></tr></thead>
              <tbody className="divide-y divide-slate-200">
                {rosterPlayers.map((p) => <tr key={p.id}><td className="px-4 py-3 font-bold text-slate-400">{p.number ?? '—'}</td><td className="px-4 py-3 font-bold text-brand">{p.name}</td><td className="px-4 py-3 text-center">{p.position}</td><td className="px-4 py-3 text-center">{p.age ?? '—'}</td><td className="px-4 py-3 text-center font-bold text-blue-600">{p.gamesPlayed}</td><td className="px-4 py-3 text-slate-600">{p.height ?? '—'}</td><td className="px-4 py-3 text-slate-600">{p.weight ?? '—'}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">The current roster is unavailable right now.</p>}
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">The pipeline</p><h2 className="text-3xl font-bold text-brand">Prospects to monitor</h2></div>
          <span className="text-sm font-bold text-slate-500">{prospects.length} prospects</span>
        </div>
        <p className="mb-6 max-w-3xl text-sm text-slate-600">Reviewed daily against the NHL API. A player qualifies while under {PROSPECT_AGE_LIMIT} and with fewer than {PROSPECT_GP_LIMIT} NHL games this season — once they cross either threshold (or leave the organization) they drop off automatically.</p>
        {prospects.length > 0 ? (
          <div className="grid gap-5">{prospects.map((p) => <ProspectCard key={p.id} prospect={p} />)}</div>
        ) : <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No qualifying prospects at the moment.</p>}
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">Every pick, 1979–present</p><h2 className="text-3xl font-bold text-brand">Draft history</h2></div>
          <span className="text-sm font-bold text-slate-500">{draftYears.reduce((sum, y) => sum + y.picks.length, 0)} picks</span>
        </div>
        <p className="mb-6 max-w-3xl text-sm text-slate-600">All Toronto Maple Leafs selections by draft year (NHL draft records begin in 1979). Click any year to expand its picks.</p>
        {draftYears.length > 0 ? (
          <div className="space-y-2">{draftYears.map((entry, i) => <DraftYearBlock key={entry.year} entry={entry} defaultOpen={i === 0} />)}</div>
        ) : <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">Draft history is unavailable right now.</p>}
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-pink-500">Since 1917</p>
        <h2 className="mb-6 text-3xl font-bold text-brand">Franchise timeline</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {HISTORY.map((item) => <article key={item.year} className="border-l-4 border-blue-500 bg-white p-5 shadow-sm"><p className="text-sm font-black text-blue-600">{item.year}</p><h3 className="mt-1 text-xl font-bold text-brand">{item.title}</h3><p className="mt-2 leading-6 text-slate-600">{item.text}</p></article>)}
        </div>
      </section>

      <section className="rounded-xl bg-brand p-7 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Championship history</p>
        <h2 className="mt-1 text-3xl font-bold text-white">13 Stanley Cups</h2>
        <div className="mt-6 flex flex-wrap gap-3">{CUP_YEARS.map((year) => { const seasonId = Number(`${year - 1}${year}`); return <Link key={year} href={`/team/season/${seasonIdToSlug(seasonId)}`} className="rounded bg-white/10 px-4 py-2 font-bold hover:bg-white/20">{year}</Link>; })}</div>
      </section>

      <section id="season-archive" className="scroll-mt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-pink-500">Year by year</p>
        <h2 className="text-3xl font-bold text-brand">Season archive</h2>
        <p className="mt-2 text-slate-600">Select any season to see the official roster and regular-season record.</p>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">{seasonIds.map((seasonId) => <Link key={seasonId} href={`/team/season/${seasonIdToSlug(seasonId)}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-brand shadow-sm hover:border-blue-400 hover:text-blue-600">{seasonIdToLabel(seasonId)}</Link>)}</div>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-pink-500">The rafters</p>
        <h2 className="mb-6 text-3xl font-bold text-brand">Retired numbers</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{RETIRED_NUMBERS.map(([number, names]) => <div key={number} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-black text-white">{number}</span><span className="font-semibold text-slate-700">{names}</span></div>)}</div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">The One Hundred</p><h2 className="mb-5 text-3xl font-bold text-brand">Official top ten Leafs</h2><ol className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-5">{TOP_TEN.map((name, index) => <li key={name} className="flex gap-4 py-3"><span className="w-6 font-black text-blue-500">{index + 1}</span><span className="font-bold text-brand">{name}</span></li>)}</ol></div>
        <div><p className="text-xs font-bold uppercase tracking-widest text-pink-500">Home ice</p><h2 className="mb-5 text-3xl font-bold text-brand">Historic venues</h2><div className="space-y-4"><Venue years="1917–1931" name="Arena Gardens" text="The franchise’s first home, also known as Mutual Street Arena." /><Venue years="1931–1999" name="Maple Leaf Gardens" text="A cathedral of hockey and home to 11 Maple Leafs championship teams." /><Venue years="1999–present" name="Scotiabank Arena" text="The Leafs’ current home in downtown Toronto, originally opened as Air Canada Centre." /></div></div>
      </section>

      <section className="flex flex-wrap gap-3 border-t border-slate-300 pt-6 text-sm font-bold">
        <a href="https://www.nhl.com/mapleleafs/team/history" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Official franchise history →</a>
        <Link href="/players" className="text-blue-600 hover:text-blue-800">Current players →</Link>
        <Link href="/standings" className="text-blue-600 hover:text-blue-800">Full standings →</Link>
      </section>
    </div>
  );
}

function DraftYearBlock({ entry, defaultOpen }: { entry: DraftYear; defaultOpen?: boolean }) {
  const firstRounders = entry.picks.filter((p) => p.round === 1).map((p) => p.name);
  return (
    <details open={defaultOpen} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xl font-black text-brand">{entry.year}</span>
          <span className="text-sm font-bold text-slate-500">{entry.picks.length} pick{entry.picks.length === 1 ? '' : 's'}</span>
          {firstRounders.length > 0 && <span className="text-sm text-slate-600">1st round: <span className="font-semibold text-brand">{firstRounders.join(', ')}</span></span>}
        </span>
        <span aria-hidden="true" className="text-blue-500 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="overflow-x-auto border-t border-slate-200">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-2 text-center">Rd</th><th className="px-4 py-2 text-center">Overall</th><th className="px-4 py-2 text-left">Player</th><th className="px-4 py-2 text-center">Pos</th><th className="px-4 py-2 text-left">Drafted from</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {entry.picks.map((pick) => (
              <tr key={pick.overall}>
                <td className="px-4 py-2 text-center text-slate-500">{pick.round || '—'}</td>
                <td className="px-4 py-2 text-center font-bold text-blue-600">{pick.overall || '—'}</td>
                <td className="px-4 py-2 font-bold text-brand">{pick.name}</td>
                <td className="px-4 py-2 text-center">{pick.position}</td>
                <td className="px-4 py-2 text-slate-600">{[pick.club, pick.league].filter(Boolean).join(' · ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function ProspectCard({ prospect }: { prospect: LeafProspect }) {
  const { name, position, age, currentClub, currentLeague, nhlGamesPlayed, isGoalie, career } = prospect;
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <h3 className="text-xl font-bold text-brand"><Link href={`/prospects/${prospect.id}`} className="hover:text-blue-600 hover:underline">{name}</Link></h3>
          <p className="mt-0.5 text-sm text-slate-600">
            {position} · Age {age ?? '—'}
            {currentClub && <> · <span className="font-semibold text-brand">{currentClub}</span> <span className="text-slate-500">({currentLeague})</span></>}
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{nhlGamesPlayed} NHL GP</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-white text-[11px] uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Season</th><th className="px-4 py-2 text-left">Team</th><th className="px-4 py-2 text-left">Lg</th><th className="px-4 py-2 text-center">GP</th>
              {isGoalie ? <><th className="px-4 py-2 text-center">W</th><th className="px-4 py-2 text-center">SV%</th><th className="px-4 py-2 text-center">GAA</th></> : <><th className="px-4 py-2 text-center">G</th><th className="px-4 py-2 text-center">A</th><th className="px-4 py-2 text-center">P</th></>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {career.map((line, i) => (
              <tr key={`${line.season}-${line.league}-${line.team}-${i}`} className={line.league === 'NHL' ? 'bg-blue-50/50' : ''}>
                <td className="px-4 py-2 font-semibold text-slate-700">{line.seasonLabel}</td>
                <td className="px-4 py-2 text-slate-700">{line.team}</td>
                <td className="px-4 py-2 font-bold text-slate-500">{line.league}</td>
                <td className="px-4 py-2 text-center">{line.gamesPlayed}</td>
                {isGoalie
                  ? <><td className="px-4 py-2 text-center">{line.wins ?? '—'}</td><td className="px-4 py-2 text-center">{fmtPct(line.savePctg)}</td><td className="px-4 py-2 text-center">{fmtGaa(line.goalsAgainstAvg)}</td></>
                  : <><td className="px-4 py-2 text-center">{line.goals ?? '—'}</td><td className="px-4 py-2 text-center">{line.assists ?? '—'}</td><td className="px-4 py-2 text-center font-bold text-brand">{line.points ?? '—'}</td></>}
              </tr>
            ))}
            {career.length === 0 && <tr><td colSpan={isGoalie ? 7 : 7} className="px-4 py-4 text-center text-slate-500">No career stats available.</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function TeamMetric({ label, value, small }: { label: string; value: string; small?: boolean }) { return <div className="rounded-lg bg-white/10 p-4"><p className="text-xs uppercase tracking-wide text-blue-200">{label}</p><p className={`mt-1 font-black text-white ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p></div>; }
function Venue({ years, name, text }: { years: string; name: string; text: string }) { return <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-sm font-black text-blue-600">{years}</p><h3 className="text-xl font-bold text-brand">{name}</h3><p className="mt-2 text-slate-600">{text}</p></article>; }
