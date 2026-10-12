import { getRosterStats, statsSeasonLabel } from '@/lib/leafs-stats';

const CORS = {
  'Access-Control-Allow-Origin': 'https://forums.tmltoday.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const stats = await getRosterStats(10);

  return Response.json(
    { season: statsSeasonLabel(stats.season), players: stats.players },
    { headers: { ...CORS, 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900' } },
  );
}
