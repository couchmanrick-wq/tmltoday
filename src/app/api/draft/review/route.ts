import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { reviewDraftPicks } from '@/lib/leafs-draft';

export async function POST(request: NextRequest) {
  if (!isAuthorized(request).authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await reviewDraftPicks();
    return NextResponse.json({ success: true, reviewedAt: new Date().toISOString(), ...result });
  } catch (error) {
    console.error('Draft review failed', error);
    return NextResponse.json({ error: 'Draft review failed' }, { status: 500 });
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
