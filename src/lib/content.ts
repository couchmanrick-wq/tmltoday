import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface ForumThread {
  title: string;
  url: string;
  author: string | null;
  publishedAt: string;
}

interface ForumThreadRow {
  title: string;
  url: string;
  author: string | null;
  published_at: string;
}

/**
 * Fetch the most recently published forum threads from D1.
 * Returns an empty array if the query fails so the page still renders.
 */
export async function getForumThreads(limit = 5): Promise<ForumThread[]> {
  try {
    const { env } = getCloudflareContext();

    const { results } = await env.DB.prepare(
      `SELECT title, url, author, published_at
       FROM content_items
       WHERE type = 'forum'
       ORDER BY published_at DESC
       LIMIT ?`
    )
      .bind(limit)
      .all<ForumThreadRow>();

    return results.map((row) => ({
      title: row.title,
      url: row.url,
      author: row.author,
      publishedAt: row.published_at,
    }));
  } catch (error) {
    console.error('Error fetching forum threads', error);
    return [];
  }
}
