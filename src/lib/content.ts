import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface ForumThread {
  title: string;
  url: string;
  author: string | null;
  publishedAt: string;
  displayTime: string | null;
  forumName: string | null;
  avatarUrl: string | null;
}

export interface ForumStaffMember {
  name: string;
  title: string | null;
  url: string | null;
  avatarUrl: string | null;
}

export interface ForumMembersOnline {
  members: Array<{ name: string; url: string | null; isStaff?: boolean }>;
  totalLabel: string | null;
}

interface ForumThreadRow {
  title: string;
  url: string;
  author: string | null;
  published_at: string;
  summary: string | null;
  source_name: string | null;
  thumbnail_url: string | null;
}

interface ForumWidgetRow {
  source_key: string;
  summary: string | null;
}

/**
 * Fetch the most recently published forum threads from D1.
 * Returns an empty array if the query fails so the page still renders.
 */
export async function getForumThreads(limit = 5): Promise<ForumThread[]> {
  try {
    const { env } = getCloudflareContext();

    let { results } = await env.DB.prepare(
      `SELECT title, url, author, published_at, summary, source_name, thumbnail_url
       FROM content_items
       WHERE type = 'forum'
         AND source_key = 'forum-latest-posts'
       ORDER BY published_at DESC
       LIMIT ?`
    )
      .bind(limit)
      .all<ForumThreadRow>();

    if (results.length === 0) {
      ({ results } = await env.DB.prepare(
        `SELECT title, url, author, published_at, summary, source_name, thumbnail_url
         FROM content_items
         WHERE type = 'forum'
         ORDER BY published_at DESC
         LIMIT ?`
      )
        .bind(limit)
        .all<ForumThreadRow>());
    }

    return results.map((row) => ({
      title: row.title,
      url: row.url,
      author: row.author,
      publishedAt: row.published_at,
      displayTime: row.summary && row.summary !== row.source_name ? row.summary : null,
      forumName: row.source_name,
      avatarUrl: row.thumbnail_url,
    }));
  } catch (error) {
    console.error('Error fetching forum threads', error);
    return [];
  }
}

export async function getForumSidebarWidgets(): Promise<{
  staffOnline: ForumStaffMember[];
  membersOnline: ForumMembersOnline | null;
}> {
  try {
    const { env } = getCloudflareContext();

    const { results } = await env.DB.prepare(
      `SELECT source_key, summary
       FROM content_items
       WHERE type = 'forum-widget'
         AND source_key IN ('staff-online', 'members-online')`
    ).all<ForumWidgetRow>();

    const staffRow = results.find((row) => row.source_key === 'staff-online');
    const membersRow = results.find((row) => row.source_key === 'members-online');

    return {
      staffOnline: parseJson<ForumStaffMember[]>(staffRow?.summary, []),
      membersOnline: parseJson<ForumMembersOnline | null>(membersRow?.summary, null),
    };
  } catch (error) {
    console.error('Error fetching forum sidebar widgets', error);
    return { staffOnline: [], membersOnline: null };
  }
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
