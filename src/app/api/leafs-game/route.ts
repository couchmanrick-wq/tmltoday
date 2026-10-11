import { getLeafsGamePanel } from '@/lib/leafs-game';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': 'https://forums.tmltoday.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  try {
    const data = await getLeafsGamePanel({ fresh: true });
    return Response.json(data, {
      headers: {
        ...CORS,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return Response.json({ error: 'Live Leafs game data is temporarily unavailable.' }, { status: 502, headers: CORS });
  }
}
