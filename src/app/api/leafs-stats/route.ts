import { getGoalieStats, getRosterStats, statsSeasonLabel } from '@/lib/leafs-stats';

const CORS = {
  'Access-Control-Allow-Origin': 'https://forums.tmltoday.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const [stats, goalies] = await Promise.all([getRosterStats(15), getGoalieStats()]);

  return Response.json(
    { season: statsSeasonLabel(stats.season), players: stats.players, goalies },
    { headers: { ...CORS, 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900' } },
  );
}
