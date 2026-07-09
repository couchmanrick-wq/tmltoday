import { NewsArticle, ContentType } from '@/types';

// Mock RSS feed sources - replace with actual feed URLs
export const RSS_FEEDS = {
  news: [
    'https://thehockeynews.com/feed',
    'https://www.tsn.ca/feed',
    'https://www.sportsnet.ca/feed',
  ],
  youtube: 'https://www.youtube.com/@TorontoMapleLeafs/videos',
  podcasts: [
    'https://podcasts.apple.com/ca/podcast/maple-leafs-talk',
  ],
};

/**
 * Fetch content from RSS feeds (mock implementation)
 * In production, use a library like `rss-parser` or `feed-parser`
 */
export async function fetchRSSFeed(
  feedUrl: string,
  contentType: ContentType
): Promise<NewsArticle[]> {
  try {
    // This is a mock implementation
    // In production, you would parse actual RSS feeds
    const response = await fetch(feedUrl, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Failed to fetch ${feedUrl}`);
    
    // Parse XML and convert to NewsArticle format
    // This requires actual RSS parsing library
    return [];
  } catch (error) {
    console.error(`Error fetching RSS feed: ${feedUrl}`, error);
    return [];
  }
}

/**
 * Fetch from Google News API for Leafs-related news
 */
export async function fetchGoogleNews(): Promise<NewsArticle[]> {
  try {
    // Mock implementation - replace with actual Google News API call
    return [];
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return [];
  }
}

/**
 * Fetch YouTube videos (mock implementation)
 */
export async function fetchYouTubeVideos(channelId: string): Promise<NewsArticle[]> {
  try {
    // Mock implementation - replace with actual YouTube API call
    return [];
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

/**
 * Combine and sort multiple content feeds
 */
export function mergeFeedsAndSort(
  feeds: NewsArticle[][]
): NewsArticle[] {
  const merged = feeds.flat();
  return merged.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Paginate results
 */
export function paginateResults<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): { items: T[]; total: number; hasMore: boolean } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total: items.length,
    hasMore: end < items.length,
  };
}

/**
 * Filter content by type
 */
export function filterByContentType(
  items: NewsArticle[],
  type: ContentType
): NewsArticle[] {
  return items.filter((item) => item.contentType === type);
}

/**
 * Filter content by time range (in hours)
 */
export function filterByTimeRange(
  items: NewsArticle[],
  hoursAgo: number = 24
): NewsArticle[] {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return items.filter((item) => new Date(item.publishedAt) > cutoffTime);
}
