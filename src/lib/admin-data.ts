import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface DashboardStats {
  total: number;
  articles: number;
  blogs: number;
  podcasts: number;
  videos: number;
  sourcesSeen: number;
  latestRefresh: string | null;
}

export interface AdminContentItem {
  id: string;
  title: string;
  description: string;
  source: string;
  link: string;
  published_at: string;
  content_type: string;
  topic: string | null;
  category: string | null;
  updated_at: string;
  reviewed: boolean;
}

export interface ContentPage {
  items: AdminContentItem[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

export interface CrawlItem {
  id: string;
  title: string;
  source: string;
  link: string;
  content_type: string;
  topic: string | null;
  importance: number | null;
  sentiment: string | null;
  is_rumour: number;
  ai_summary: string | null;
  published_at: string;
  updated_at: string;
}

export interface CrawlStats {
  enriched: number;
  rumours: number;
  topics: number;
  avgImportance: number | null;
  lastCrawl: string | null;
}

export interface Contributor {
  author: string;
  items: number;
  sources: number;
  latest: string;
}

export interface SourceHealth {
  id: string;
  name: string;
  kind: string;
  url: string;
  contentType: string;
  hasFeed: boolean;
  items: number;
  latest: string | null;
  status: 'fresh' | 'stale' | 'silent';
}

const STALE_AFTER_HOURS = 72;

export async function getDashboardStats(): Promise<DashboardStats> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) total, SUM(content_type = 'article') articles, SUM(content_type = 'blog') blogs, SUM(content_type = 'podcast') podcasts, SUM(content_type = 'video') videos, COUNT(DISTINCT source) sourcesSeen, MAX(updated_at) latestRefresh FROM enriched_content`,
  ).first<Record<string, number | string | null>>();
  return {
    total: Number(row?.total ?? 0),
    articles: Number(row?.articles ?? 0),
    blogs: Number(row?.blogs ?? 0),
    podcasts: Number(row?.podcasts ?? 0),
    videos: Number(row?.videos ?? 0),
    sourcesSeen: Number(row?.sourcesSeen ?? 0),
    latestRefresh: typeof row?.latestRefresh === 'string' ? row.latestRefresh : null,
  };
}

const CONTENT_COLUMNS = `id, title, description, source, link, published_at, content_type, topic, category, updated_at`;

type ContentRow = Omit<AdminContentItem, 'reviewed'>;

async function getReviewedIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { env } = getCloudflareContext();
  try {
    const placeholders = ids.map(() => '?').join(', ');
    const { results } = await env.DB.prepare(
      `SELECT id FROM reviewed_content WHERE id IN (${placeholders})`,
    ).bind(...ids).all<{ id: string }>();
    return new Set(results.map((row) => row.id));
  } catch {
    return new Set();
  }
}

async function withReviewed(rows: ContentRow[]): Promise<AdminContentItem[]> {
  const reviewed = await getReviewedIds(rows.map((row) => row.id));
  return rows.map((row) => ({ ...row, reviewed: reviewed.has(row.id) }));
}

export async function getContentPage(page = 1, perPage = 50): Promise<ContentPage> {
  const { env } = getCloudflareContext();
  const countRow = await env.DB.prepare(`SELECT COUNT(*) total FROM enriched_content`).first<{ total: number }>();
  const total = Number(countRow?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const offset = (current - 1) * perPage;
  const { results } = await env.DB.prepare(
    `SELECT ${CONTENT_COLUMNS} FROM enriched_content ORDER BY published_at DESC LIMIT ? OFFSET ?`,
  ).bind(perPage, offset).all<ContentRow>();
  return { items: await withReviewed(results), total, page: current, perPage, pages };
}

export async function getContentByType(contentType: string, limit = 50): Promise<AdminContentItem[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT ${CONTENT_COLUMNS} FROM enriched_content WHERE content_type = ? ORDER BY published_at DESC LIMIT ?`,
  ).bind(contentType, limit).all<ContentRow>();
  return withReviewed(results);
}

export async function getContentItem(id: string): Promise<AdminContentItem | null> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    `SELECT ${CONTENT_COLUMNS} FROM enriched_content WHERE id = ?`,
  ).bind(id).first<ContentRow>();
  if (!row) return null;
  return (await withReviewed([row]))[0];
}

export async function getCrawlItems(limit = 40): Promise<CrawlItem[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT id, title, source, link, content_type, topic, importance, sentiment, is_rumour, ai_summary, published_at, updated_at FROM enriched_content WHERE ai_summary IS NOT NULL AND ai_summary != '' ORDER BY updated_at DESC LIMIT ?`,
  ).bind(limit).all<CrawlItem>();
  return results;
}

export async function getCrawlStats(): Promise<CrawlStats> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    `SELECT SUM(ai_summary IS NOT NULL AND ai_summary != '') enriched, SUM(is_rumour = 1) rumours, COUNT(DISTINCT topic) topics, AVG(importance) avgImportance, MAX(updated_at) lastCrawl FROM enriched_content`,
  ).first<Record<string, number | string | null>>();
  return {
    enriched: Number(row?.enriched ?? 0),
    rumours: Number(row?.rumours ?? 0),
    topics: Number(row?.topics ?? 0),
    avgImportance: row?.avgImportance == null ? null : Number(row.avgImportance),
    lastCrawl: typeof row?.lastCrawl === 'string' ? row.lastCrawl : null,
  };
}

export async function getContributors(): Promise<Contributor[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT author, COUNT(*) items, COUNT(DISTINCT source) sources, MAX(published_at) latest FROM enriched_content WHERE author IS NOT NULL AND trim(author) != '' GROUP BY author ORDER BY items DESC, latest DESC LIMIT 100`,
  ).all<Contributor>();
  return results;
}

export async function getBlockedCount(): Promise<number> {
  const { env } = getCloudflareContext();
  try {
    const row = await env.DB.prepare(`SELECT COUNT(*) count FROM blocked_content`).first<{ count: number }>();
    return Number(row?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function getSourceHealth(
  sources: { id: string; name: string; kind: string; url: string; contentType: string; feedUrl?: string }[],
): Promise<SourceHealth[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT source, COUNT(*) items, MAX(published_at) latest FROM enriched_content GROUP BY source`,
  ).all<{ source: string; items: number; latest: string }>();

  const bySource = new Map(results.map((row) => [row.source, row]));
  const now = Date.now();

  return sources
    .map((source) => {
      const match = bySource.get(source.name);
      const latest = match?.latest ?? null;
      let status: SourceHealth['status'] = 'silent';
      if (latest) {
        const ageHours = (now - new Date(latest).getTime()) / 3_600_000;
        status = ageHours <= STALE_AFTER_HOURS ? 'fresh' : 'stale';
      }
      return {
        id: source.id,
        name: source.name,
        kind: source.kind,
        url: source.url,
        contentType: source.contentType,
        hasFeed: Boolean(source.feedUrl),
        items: Number(match?.items ?? 0),
        latest,
        status,
      };
    })
    .sort((a, b) => {
      const order = { silent: 0, stale: 1, fresh: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return b.items - a.items;
    });
}
