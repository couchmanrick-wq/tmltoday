'use client';

import { PlayerGrid } from '@/components/content/PlayerCard';
import { getTrendingPlayers, LEAFS_ROSTER } from '@/data/teams';

export default function PlayersPage() {
  const trendingPlayers = getTrendingPlayers();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Players</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Get to know the Toronto Maple Leafs roster and track trending players.
        </p>
      </div>

      {/* Trending Players */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Players</h2>
        <PlayerGrid players={trendingPlayers} cols={4} />
      </section>

      {/* Full Roster */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Full Roster</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Position</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Height</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Weight</th>
                <th className="text-center px-4 py-3 font-semibold">Buzz</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {LEAFS_ROSTER.map((player) => (
                <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3 font-bold">{player.number}</td>
                  <td className="px-4 py-3 font-semibold">{player.name}</td>
                  <td className="px-4 py-3">{player.position}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm">{player.height}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm">{player.weight}</td>
                  <td className="text-center px-4 py-3 font-bold text-blue-600">
                    {player.mentions || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
