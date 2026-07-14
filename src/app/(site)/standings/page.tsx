import { getAtlanticStandings, NHL_STANDINGS_SOURCE_URL } from '@/lib/nhl-standings';

export const metadata = { alternates: { canonical: '/standings' } };

export default async function StandingsPage() {
  const standings = await getAtlanticStandings();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Standings</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Atlantic Division standings and league information.
        </p>
      </div>

      {/* Division Standings */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Atlantic Division (2025-26)</h2>
          <a href={NHL_STANDINGS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Source: NHL
          </a>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Team</th>
                <th className="text-center px-4 py-3 font-semibold">GP</th>
                <th className="text-center px-4 py-3 font-semibold">W</th>
                <th className="text-center px-4 py-3 font-semibold">L</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">OTL</th>
                <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">GF</th>
                <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">GA</th>
                <th className="text-center px-4 py-3 font-semibold">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {standings.map((row) => (
                <tr
                  key={row.team}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    row.team === 'Toronto Maple Leafs'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{row.team}</td>
                  <td className="text-center px-4 py-3 text-sm">{row.gp}</td>
                  <td className="text-center px-4 py-3 text-sm">{row.wins}</td>
                  <td className="text-center px-4 py-3 text-sm">{row.losses}</td>
                  <td className="text-center px-4 py-3 text-sm hidden sm:table-cell">
                    {row.otl}
                  </td>
                  <td className="text-center px-4 py-3 text-sm hidden md:table-cell">
                    {row.goalsFor}
                  </td>
                  <td className="text-center px-4 py-3 text-sm hidden md:table-cell">
                    {row.goalsAgainst}
                  </td>
                  <td className="text-center px-4 py-3 font-bold text-lg text-blue-600">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Legend */}
      <section className="bg-blue-50 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="font-bold mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">GP</span> - Games Played
          </div>
          <div>
            <span className="font-semibold">W</span> - Wins
          </div>
          <div>
            <span className="font-semibold">L</span> - Losses
          </div>
          <div>
            <span className="font-semibold">OTL</span> - Overtime Losses
          </div>
          <div>
            <span className="font-semibold">GF</span> - Goals For
          </div>
          <div>
            <span className="font-semibold">GA</span> - Goals Against
          </div>
          <div>
            <span className="font-semibold">PTS</span> - Points
          </div>
        </div>
      </section>
    </div>
  );
}
