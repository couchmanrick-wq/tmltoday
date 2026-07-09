import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle, ContentFeed } from '@/types';
import { mergeFeedsAndSort, paginateResults, filterByContentType } from '@/lib/feeds';

// Mock content repository - replace with real data fetching
const mockContent: NewsArticle[] = [
  {
    id: '1',
    title: 'Leafs Sign New Forward in Mid-Season Trade',
    description: 'Toronto Maple Leafs management announces signing of promising forward.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Full Game Highlights: Leafs vs Lightning',
    description: 'Watch the complete highlights from the matchup.',
    source: 'YouTube',
    sourceUrl: 'https://youtube.com',
    link: 'https://youtube.com',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'article' | 'video' | 'podcast' | undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Filter by content type if specified
    let content = mockContent;
    if (type) {
      content = filterByContentType(content, type);
    }

    // Sort by date
    content = mergeFeedsAndSort([content]);

    // Paginate
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
