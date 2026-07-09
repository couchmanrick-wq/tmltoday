import { NextRequest, NextResponse } from 'next/server';
import { ContentFeed, ContentType, StoryTopic } from '@/types';
import { mergeFeedsAndSort, paginateResults } from '@/lib/feeds';
import { getEnrichedArticles } from '@/lib/aggregator/db';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ContentType | undefined;
    const topic = searchParams.get('topic') as StoryTopic | undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    let content = await getEnrichedArticles({ limit: 100, type, topic });

    if (content.length === 0) {
      content = FALLBACK_ARTICLES.filter((article) => (!type || article.contentType === type) && (!topic || article.topic === topic));
    }

    content = mergeFeedsAndSort([content]);

    const { items, total, hasMore } = paginateResults(content, page, pageSize);

    const response: ContentFeed = {
      items,
      total,
      page,
      pageSize,
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
