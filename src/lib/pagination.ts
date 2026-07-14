import { ArticleQuery, countEnrichedArticles, getEnrichedArticles } from '@/lib/aggregator/db';
import { NewsArticle } from '@/types';

export const PAGE_SIZE = 10;

export interface ArticlePage {
  articles: NewsArticle[];
  page: number;
  pageCount: number;
  total: number;
}

/** Reads `?page=` defensively — anything that is not a page number lands the reader on page 1. */
export function parsePageParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? '', 10);

  return Number.isFinite(page) && page > 1 ? page : 1;
}

function countPages(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/**
 * Fetches one page of the feed. When the table has nothing to offer (a cold database, or a filter
 * that matches no rows) the caller's fallback list is paged through in memory instead, so the page
 * still renders something.
 */
export async function getArticlePage(
  query: ArticleQuery,
  requestedPage: number,
  fallback: NewsArticle[] = []
): Promise<ArticlePage> {
  const total = await countEnrichedArticles(query);

  if (total === 0) {
    const pageCount = countPages(fallback.length);
    const page = Math.min(requestedPage, pageCount);
    const start = (page - 1) * PAGE_SIZE;

    return { articles: fallback.slice(start, start + PAGE_SIZE), page, pageCount, total: fallback.length };
  }

  const pageCount = countPages(total);
  // A reader who lands on ?page=99 gets the last real page rather than an empty one.
  const page = Math.min(requestedPage, pageCount);
  const articles = await getEnrichedArticles({
    ...query,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return { articles, page, pageCount, total };
}
