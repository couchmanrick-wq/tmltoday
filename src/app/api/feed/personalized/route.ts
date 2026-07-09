import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedArticles } from '@/lib/aggregator/db';
import { personalizeFeed } from '@/lib/aggregator/pipeline';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const preferences = {
    players: searchParams.get('players')?.split(',').filter(Boolean),
    topics: searchParams.get('topics')?.split(',').filter(Boolean),
    sources: searchParams.get('sources')?.split(',').filter(Boolean),
  };

  const articles = await getEnrichedArticles({ limit: 80 });
  const feed = personalizeFeed(articles.length > 0 ? articles : FALLBACK_ARTICLES, preferences);

  return NextResponse.json({
    items: feed.slice(0, 30),
    total: feed.length,
    timestamp: new Date().toISOString(),
  });
}
