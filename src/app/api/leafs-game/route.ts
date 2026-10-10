import { getLeafsGamePanel } from '@/lib/leafs-game';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLeafsGamePanel({ fresh: true });
    return Response.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return Response.json({ error: 'Live Leafs game data is temporarily unavailable.' }, { status: 502 });
  }
}
