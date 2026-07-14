import { getTrendingPlayers } from '@/data/teams';
import { SiteContentFrame } from '@/components/layout/SiteContentFrame';
import { getRosterStats } from '@/lib/leafs-stats';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rosterStats = await getRosterStats();
  const trendingPlayers = getTrendingPlayers();

  return <SiteContentFrame trendingPlayers={trendingPlayers} rosterStats={rosterStats}>{children}</SiteContentFrame>;
}
