import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { runAggregator } from '@/lib/aggregator/pipeline';

export async function POST(request: NextRequest) {
  const authResult = isAuthorized(request);

  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAggregator({ limitPerSource: 8 });

    return NextResponse.json({
      success: true,
      refreshedAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Aggregator refresh failed', error);
    return NextResponse.json({ error: 'Aggregator refresh failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

function isAuthorized(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const secret = (env as CloudflareEnv & { AGGREGATOR_SECRET?: string }).AGGREGATOR_SECRET;

    if (!secret) return { authorized: process.env.NODE_ENV !== 'production' };

    const header = request.headers.get('authorization');
    const token = request.nextUrl.searchParams.get('token');

    return { authorized: header === `Bearer ${secret}` || token === secret };
  } catch {
    return { authorized: process.env.NODE_ENV !== 'production' };
  }
}
