import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerProfile, ProfileSubject } from '@/components/content/PlayerProfile';
import { playerSlug } from '@/data/teams';
import { getArticlesForPlayer } from '@/lib/aggregator/db';
import { getLeafsRoster } from '@/lib/leafs-prospects';
import { getLeafsSalaries, toSalaryLine } from '@/lib/leafs-salaries';
import { getClubSeasonStats, statsSeasonLabel } from '@/lib/leafs-stats';

export const dynamic = 'force-dynamic';

export default async function PlayerHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roster = await getLeafsRoster();
  const player = roster.players.find((entry) => playerSlug(entry.name).toLowerCase() === slug.toLowerCase());

  if (!player) notFound();

  const [seasonStats, salaries, stories] = await Promise.all([
    getClubSeasonStats(),
    getLeafsSalaries(),
    getArticlesForPlayer(player.name),
  ]);

  const stats = seasonStats.byPlayerId.get(player.id);
  const salary = salaries.get(player.id);

  const subject: ProfileSubject = {
    kind: 'Player',
    name: player.name,
    headshot: player.headshot,
    position: player.position,
    number: player.number,
    teamLabel: 'Toronto Maple Leafs',
    stats: stats?.cells ?? [],
    statsContext: stats?.season ? `${statsSeasonLabel(stats.season)} regular season` : null,
    salary: salary ? toSalaryLine(salary) : null,
    reference: {
      label: 'Current official roster',
      href: 'https://www.nhl.com/mapleleafs/roster',
      note: 'Active roster',
    },
    details: [
      player.age != null ? `Age ${player.age}` : null,
      player.height,
      player.weight,
    ].filter((detail): detail is string => Boolean(detail)),
  };

  return (
    <div className="space-y-8">
      <Link href="/players" className="inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
        &larr; All players
      </Link>

      <PlayerProfile subject={subject} stories={stories} />
    </div>
  );
}
