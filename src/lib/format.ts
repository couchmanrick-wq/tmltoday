import { NewsArticle } from '@/types';

/**
 * "Toronto Star - Dave Feschuk" for written pieces. Podcasts and videos are credited to the show or
 * channel rather than a writer, so they stay as just the publication.
 */
export function sourceByline(article: Pick<NewsArticle, 'source' | 'author' | 'contentType'>): string {
  const creditsAuthor = article.contentType !== 'podcast' && article.contentType !== 'video';

  return creditsAuthor && article.author ? `${article.source} - ${article.author}` : article.source;
}

/**
 * Render an ISO timestamp as a coarse "time ago" string,
 * falling back to a locale date once it is a week old.
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
