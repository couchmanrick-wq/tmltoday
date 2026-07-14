'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RosterStats, statsSeasonLabel } from '@/lib/leafs-stats';
import { FilterNav } from '@/components/layout/FilterNav';
import { NewsletterCard } from '@/components/layout/NewsletterCard';
import { SiteHero } from '@/components/layout/SiteHero';
import { playerSlug } from '@/data/teams';

interface TrendingPlayer {
  id: string;
  name: string;
  mentions?: number;
}

export function SiteContentFrame({
  children,
  trendingPlayers,
  rosterStats,
}: {
  children: React.ReactNode;
  trendingPlayers: TrendingPlayer[];
  rosterStats: RosterStats;
}) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>;
  }

  return (
    <>
      <SiteHero />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8">
      <main className="min-w-0">
        <div className="mb-8 flex lg:border-b lg:border-slate-300">
          <FilterNav />
        </div>

        {children}
      </main>

      <aside className="min-w-0 space-y-10">
        <SearchBox />

        <NewsletterCard />

        <RailSection
          title="Trending players"
          action={<span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">Buzz</span>}
        >
          <div className="divide-y divide-slate-300">
            {trendingPlayers.slice(0, 10).map((player) => (
              <Link key={player.id} href={`/players/${playerSlug(player.name)}`} className="flex items-center justify-between gap-2 py-3 text-brand hover:text-blue-500">
                <span className="font-bold">{player.name}</span>
                <span className="shrink-0 text-sm font-bold text-blue-500">
                  {player.mentions ?? 0} <span className="text-[10px] uppercase text-slate-500">mentions</span>
                </span>
              </Link>
            ))}
          </div>
        </RailSection>

        <RailSection
          title="Player stats"
          action={rosterStats.season ? <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{statsSeasonLabel(rosterStats.season)}</span> : undefined}
        >
          {rosterStats.players.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-300 text-[10px] uppercase text-slate-500">
                <tr><th className="py-3 text-left">Player</th><th className="py-3 text-right">GP</th><th className="py-3 text-right">G</th><th className="py-3 text-right">A</th><th className="py-3 text-right">PTS</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {rosterStats.players.map((player, i) => (
                  <tr key={player.id}>
                    <td className="py-3 font-bold text-brand"><span className="mr-2 text-blue-500">{i + 1}</span>{player.name}</td>
                    <td className="py-3 text-right text-slate-600">{player.gamesPlayed}</td>
                    <td className="py-3 text-right text-slate-600">{player.goals}</td>
                    <td className="py-3 text-right text-slate-600">{player.assists}</td>
                    <td className="py-3 text-right font-bold text-brand">{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="py-3 text-sm text-slate-500">Player stats will appear once the season starts.</p>}
        </RailSection>

      </aside>
      </div>
    </>
  );
}

function RailSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t-4 border-brand pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold leading-tight text-brand">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function SearchBox() {
  return (
    <form action="/news" className="flex h-12 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <span className="flex items-center pl-4 text-slate-500" aria-hidden="true">⌕</span>
      <label htmlFor="page-search" className="sr-only">Search news</label>
      <input id="page-search" name="q" type="search" placeholder="Search players, teams, topics..." className="min-w-0 flex-1 px-3 text-sm outline-none" />
      <button type="submit" className="m-1 rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-blue-800">Go</button>
    </form>
  );
}
