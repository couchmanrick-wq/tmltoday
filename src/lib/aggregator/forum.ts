import { DOMParser } from 'linkedom';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { FORUM_URL } from '@/lib/site';
import { ForumMembersOnline, ForumStaffMember, ForumThread } from '@/lib/content';

const FORUM_LATEST_SOURCE_KEY = 'forum-latest-posts';

type QueryableDocument = Pick<Element, 'querySelector' | 'querySelectorAll'>;

export async function refreshLatestForumPosts(limit = 10) {
  const snapshot = await fetchForumSnapshot(limit);
  await saveLatestForumPosts(snapshot.posts);
  await saveForumWidgets(snapshot);

  return {
    discovered: snapshot.posts.length,
    saved: snapshot.posts.length + snapshot.staffOnline.length + (snapshot.membersOnline ? 1 : 0),
  };
}

export async function fetchLatestForumPosts(limit = 10): Promise<ForumThread[]> {
  return (await fetchForumSnapshot(limit)).posts;
}

async function fetchForumSnapshot(limit = 10): Promise<{
  posts: ForumThread[];
  staffOnline: ForumStaffMember[];
  membersOnline: ForumMembersOnline | null;
}> {
  const response = await fetch(FORUM_URL, {
    headers: { 'user-agent': 'TMLtodayBot/1.0 (+https://tmltoday.com)' },
  });

  if (!response.ok) throw new Error(`Forum returned ${response.status}`);

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  const postsWidget = document.querySelector('[data-widget-key="New_Posts"]');

  const posts = postsWidget
    ? [...postsWidget.querySelectorAll('li.block-row')]
        .map((row) => parseForumPost(row))
        .filter((post): post is ForumThread => Boolean(post))
        .slice(0, limit)
    : [];

  return {
    posts,
    staffOnline: parseStaffOnline(document),
    membersOnline: parseMembersOnline(document),
  };
}

async function saveLatestForumPosts(posts: ForumThread[]) {
  const { env } = getCloudflareContext();

  await env.DB.prepare(
    `DELETE FROM content_items
     WHERE type = 'forum'
       AND source_key = ?`
  )
    .bind(FORUM_LATEST_SOURCE_KEY)
    .run();

  if (posts.length === 0) return;

  await env.DB.batch(
    posts.map((post) =>
      env.DB.prepare(
        `INSERT INTO content_items (
          type, source_key, source_name, title, url, thumbnail_url, summary, author, published_at, fetched_at
        )
        VALUES ('forum', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(
        FORUM_LATEST_SOURCE_KEY,
        post.displayTime ?? post.forumName ?? 'TML Today Community',
        post.title,
        post.url,
        post.avatarUrl,
        post.forumName ?? 'TML Today Community',
        post.author,
        post.publishedAt
      )
    )
  );
}

async function saveForumWidgets(snapshot: {
  staffOnline: ForumStaffMember[];
  membersOnline: ForumMembersOnline | null;
}) {
  const { env } = getCloudflareContext();

  await env.DB.prepare(
    `DELETE FROM content_items
     WHERE type = 'forum-widget'
       AND source_key IN ('staff-online', 'members-online')`
  ).run();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO content_items (
        type, source_key, source_name, title, url, thumbnail_url, summary, author, published_at, fetched_at
      )
      VALUES ('forum-widget', 'staff-online', 'Staff online', 'Staff online', ?, NULL, ?, NULL, datetime('now'), datetime('now'))`
    ).bind(FORUM_URL, JSON.stringify(snapshot.staffOnline)),
    env.DB.prepare(
      `INSERT INTO content_items (
        type, source_key, source_name, title, url, thumbnail_url, summary, author, published_at, fetched_at
      )
      VALUES ('forum-widget', 'members-online', 'Members online', 'Members online', ?, NULL, ?, NULL, datetime('now'), datetime('now'))`
    ).bind(`${FORUM_URL}online/`, JSON.stringify(snapshot.membersOnline)),
  ]);
}

function parseForumPost(row: Element): ForumThread | null {
  const titleLink = row.querySelector('.contentRow-main > a[href*="/threads/"]');
  const forumLink = row.querySelector('.contentRow-minor a[href*="/forums/"]');
  const avatar = row.querySelector('.contentRow-figure img');
  const latestText = [...row.querySelectorAll('.contentRow-minor li')]
    .map((item) => normalizeWhitespace(item.textContent ?? ''))
    .find((text) => text.toLowerCase().startsWith('latest:'));
  const time = row.querySelector('time[datetime]');
  const displayTime = normalizeWhitespace(time?.textContent ?? '');
  const title = normalizeWhitespace(titleLink?.textContent ?? '');
  const href = titleLink?.getAttribute('href');

  if (!title || !href) return null;

  const author = latestText?.replace(/^Latest:\s*/i, '').trim() || avatar?.getAttribute('alt') || null;

  return {
    title,
    url: absoluteUrl(href),
    author,
    publishedAt: normalizeForumDate(time?.getAttribute('datetime')),
    displayTime: displayTime || null,
    forumName: normalizeWhitespace(forumLink?.textContent ?? '') || null,
    avatarUrl: avatar?.getAttribute('src') ? absoluteUrl(avatar.getAttribute('src')!) : null,
  };
}

function parseStaffOnline(document: QueryableDocument): ForumStaffMember[] {
  const widget = document.querySelector('[data-widget-section="staffMembers"]');
  if (!widget) return [];

  return [...widget.querySelectorAll('li.block-row')]
    .map((row) => {
      const userLink = row.querySelector('.contentRow-main a.username');
      const avatar = row.querySelector('.contentRow-figure img');
      const name = normalizeWhitespace(userLink?.textContent ?? '');

      if (!name) return null;

      return {
        name,
        title: normalizeWhitespace(row.querySelector('.userTitle')?.textContent ?? '') || null,
        url: userLink?.getAttribute('href') ? absoluteUrl(userLink.getAttribute('href')!) : null,
        avatarUrl: avatar?.getAttribute('src') ? absoluteUrl(avatar.getAttribute('src')!) : null,
      };
    })
    .filter((member): member is ForumStaffMember => Boolean(member));
}

function parseMembersOnline(document: QueryableDocument): ForumMembersOnline | null {
  const widget = document.querySelector('[data-widget-section="onlineNow"]');
  if (!widget) return null;

  const members = [...widget.querySelectorAll('.listInline--comma a.username')].map((link) => ({
    name: normalizeWhitespace(link.textContent ?? ''),
    url: link.getAttribute('href') ? absoluteUrl(link.getAttribute('href')!) : null,
    isStaff: Boolean(link.querySelector('[class*="username--staff"]')),
  })).filter((member) => member.name);

  return {
    members,
    totalLabel: normalizeWhitespace(widget.querySelector('.block-footer-counter')?.textContent ?? '') || null,
  };
}

function normalizeForumDate(value: string | null | undefined) {
  if (!value) return new Date().toISOString();

  const normalized = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const timestamp = Date.parse(normalized);

  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function absoluteUrl(value: string) {
  return new URL(value, FORUM_URL).toString();
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}
