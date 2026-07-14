import Link from 'next/link';
import { PlayerGrid } from '@/components/content/PlayerCard';
import { getTrendingPlayers, playerSlug } from '@/data/teams';
import { getLeafsRoster } from '@/lib/leafs-prospects';
import { formatSalary, getLeafsSalaries } from '@/lib/leafs-salaries';

export const metadata = {
  title: 'Players - TML Today',
  description: 'Toronto Maple Leafs roster and trending players.',
  alternates: { canonical: '/players' },
};

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
  const trendingPlayers = getTrendingPlayers();
  const [roster, salaries] = await Promise.all([getLeafsRoster(), getLeafsSalaries()]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Players</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Get to know the Toronto Maple Leafs roster and track trending players.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Players</h2>
        <PlayerGrid players={trendingPlayers} cols={4} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Full Roster</h2>
        <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-slate-800">
          <table className="w-full min-w-[560px]">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Pos</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Height</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Weight</th>
                <th className="px-4 py-3 text-right font-semibold">Cap hit</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {roster.players.map((player) => {
                const salary = salaries.get(player.id);

                return (
                  <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3 font-bold">{player.number ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/players/${playerSlug(player.name)}`} className="hover:text-blue-600">
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{player.position}</td>
                    <td className="hidden px-4 py-3 text-sm sm:table-cell">{player.height ?? '—'}</td>
                    <td className="hidden px-4 py-3 text-sm sm:table-cell">{player.weight ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      {salary ? formatSalary(salary.aav) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
