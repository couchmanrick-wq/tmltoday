import { getCloudflareContext } from '@opennextjs/cloudflare';
import { countEnrichedArticles, getEnrichedArticles } from '@/lib/aggregator/db';

export interface NewsletterEditionSummary {
  date: string;
  count: number;
}

const EDITIONS_PAGE_SIZE = 20;

/**
 * An "edition" isn't a stored row — it's just a calendar day that has content. This lists the days
 * that qualify, newest first, the same way the archive index needs them.
 */
export async function getNewsletterEditionDates(page = 1): Promise<{
  editions: NewsletterEditionSummary[];
  page: number;
  pageCount: number;
}> {
  try {
    const { env } = getCloudflareContext();
    const offset = (page - 1) * EDITIONS_PAGE_SIZE;
    const { results } = await env.DB.prepare(
      `SELECT substr(published_at, 1, 10) AS date, COUNT(*) AS count
       FROM enriched_content
       WHERE duplicate_of IS NULL
       GROUP BY date
       ORDER BY date DESC
       LIMIT ? OFFSET ?`
    )
      .bind(EDITIONS_PAGE_SIZE, offset)
      .all<{ date: string; count: number }>();

    const totalRow = await env.DB.prepare(
      `SELECT COUNT(DISTINCT substr(published_at, 1, 10)) AS total
       FROM enriched_content
       WHERE duplicate_of IS NULL`
    ).first<{ total: number }>();

    const total = totalRow?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / EDITIONS_PAGE_SIZE));

    return { editions: results, page: Math.min(page, pageCount), pageCount };
  } catch (error) {
    console.error('Error listing newsletter editions', error);
    return { editions: [], page: 1, pageCount: 1 };
  }
}

/** The stories that make up one day's edition, top story first. */
export async function getNewsletterEdition(date: string) {
  const [articles, total] = await Promise.all([
    getEnrichedArticles({ date, excludeDuplicates: true, orderBy: 'importance', limit: 20 }),
    countEnrichedArticles({ date, excludeDuplicates: true }),
  ]);

  return { articles, total };
}
