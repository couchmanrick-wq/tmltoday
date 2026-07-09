'use client';

import Link from 'next/link';
import { TORONTO_MAPLE_LEAFS } from '@/data/teams';

// Mock other teams in the division
const DIVISION_TEAMS = [
  {
    id: 'bos',
    name: 'Boston Bruins',
    abbreviation: 'BOS',
    city: 'Boston',
    wins: 52,
    points: 112,
  },
  {
    id: 'fla',
    name: 'Florida Panthers',
    abbreviation: 'FLA',
    city: 'Florida',
    wins: 50,
    points: 110,
  },
  {
    id: 'tba',
    name: 'Tampa Bay Lightning',
    abbreviation: 'TBA',
    city: 'Tampa Bay',
    wins: 48,
    points: 108,
  },
];

export default function TeamsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Teams</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Track the Toronto Maple Leafs and division rivals.
        </p>
      </div>

      {/* Featured Team - Leafs */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Toronto Maple Leafs</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <h3 className="text-3xl font-bold mb-2 text-white">{TORONTO_MAPLE_LEAFS.name}</h3>
            <p className="text-blue-100">{TORONTO_MAPLE_LEAFS.city}, Ontario</p>
          </div>
          <div className="p-8">
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              {TORONTO_MAPLE_LEAFS.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded">
                <p className="text-sm text-slate-600 dark:text-slate-400">Founded</p>
                <p className="text-2xl font-bold">{TORONTO_MAPLE_LEAFS.founded}</p>
              </div>
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded">
                <p className="text-sm text-slate-600 dark:text-slate-400">Record</p>
                <p className="text-2xl font-bold">48-22-12</p>
              </div>
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded">
                <p className="text-sm text-slate-600 dark:text-slate-400">Points</p>
                <p className="text-2xl font-bold">108</p>
              </div>
            </div>
            <Link
              href="/players"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View Full Roster →
            </Link>
          </div>
        </div>
      </section>

      {/* Division Teams */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Atlantic Division</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DIVISION_TEAMS.map((team) => (
            <div
              key={team.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {team.abbreviation}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Wins</span>
                  <span className="font-bold">{team.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Points</span>
                  <span className="font-bold">{team.points}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Division Standings */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Division Standings</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Team</th>
                <th className="text-center px-4 py-3 font-semibold">W</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">L</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">OTL</th>
                <th className="text-center px-4 py-3 font-semibold">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {[
                { rank: 1, name: 'Toronto Maple Leafs', w: 48, l: 22, otl: 12, pts: 108 },
                ...DIVISION_TEAMS.map((team) => ({
                  rank: Math.floor(Math.random() * 2) + 2,
                  name: team.name,
                  w: team.wins,
                  l: Math.floor(Math.random() * 30) + 20,
                  otl: Math.floor(Math.random() * 12) + 8,
                  pts: team.points,
                })),
              ]
                .sort((a, b) => b.pts - a.pts)
                .map((row, idx) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="text-center px-4 py-3">{row.w}</td>
                    <td className="text-center px-4 py-3 hidden sm:table-cell">{row.l}</td>
                    <td className="text-center px-4 py-3 hidden sm:table-cell">{row.otl}</td>
                    <td className="text-center px-4 py-3 font-bold text-blue-600">
                      {row.pts}
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
