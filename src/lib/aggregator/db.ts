import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NewsArticle, NewsroomFeed } from '@/types';

interface EnrichedContentRow {
  id: string;
  title: string;
  description: string;
  source: string;
  source_url: string;
  link: string;
  image: string | null;
  published_at: string;
  content_type: NewsArticle['contentType'];
  category: string | null;
  author: string | null;
  ai_summary: string | null;
  key_takeaways: string | null;
  players: string | null;
  coaches: string | null;
  topic: NewsArticle['topic'] | null;
  is_rumour: number;
  rumour_confidence: number | null;
  sentiment: NewsArticle['sentiment'] | null;
  tags: string | null;
  duplicate_of: string | null;
  importance: number | null;
}

export async function getEnrichedArticles(options: { limit?: number; type?: NewsArticle['contentType']; topic?: NewsArticle['topic'] } = {}) {
  try {
    const { env } = getCloudflareContext();
    const limit = options.limit ?? 40;
    const filters: string[] = [];
    const bindings: Array<string | number> = [];

    if (options.type) {
      filters.push('content_type = ?');
      bindings.push(options.type);
    }

    if (options.topic) {
      filters.push('topic = ?');
      bindings.push(options.topic);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `
      SELECT *
      FROM enriched_content
      ${where}
      ORDER BY importance DESC, published_at DESC
      LIMIT ?
    `;

    const { results } = await env.DB.prepare(query)
      .bind(...bindings, limit)
      .all<EnrichedContentRow>();

    return results.map(rowToArticle);
  } catch (error) {
    console.error('Error fetching enriched content', error);
    return [];
  }
}

export async function getNewsroomFeed(): Promise<NewsroomFeed> {
  const articles = await getEnrichedArticles({ limit: 80 });
  const visible = articles.filter((article) => !article.duplicateOf);
  const latest = [...visible].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    topStory: visible[0],
    breaking: filterByTopic(visible, 'breaking').slice(0, 6),
    latest: latest.slice(0, 10),
    trending: visible.slice(0, 8),
    rumours: visible.filter((article) => article.isRumour).slice(0, 6),
    analysis: filterByTopic(visible, 'analysis').slice(0, 6),
    videos: visible.filter((article) => article.contentType === 'video').slice(0, 6),
    podcasts: visible.filter((article) => article.contentType === 'podcast').slice(0, 6),
    tweets: visible.filter((article) => article.contentType === 'tweet').slice(0, 6),
  };
}

export async function getEnrichedArticleById(id: string) {
  const articles = await getEnrichedArticles({ limit: 100 });
  return articles.find((article) => article.id === id) ?? null;
}

export async function saveEnrichedArticles(articles: NewsArticle[]) {
  if (articles.length === 0) return { saved: 0 };

  const { env } = getCloudflareContext();
  const statements = articles.map((article) =>
    env.DB.prepare(
      `
        INSERT INTO enriched_content (
          id, title, description, source, source_url, link, image, published_at,
          content_type, category, author, ai_summary, key_takeaways, players,
          coaches, topic, is_rumour, rumour_confidence, sentiment, tags,
          duplicate_of, importance, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(link) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          ai_summary = excluded.ai_summary,
          key_takeaways = excluded.key_takeaways,
          players = excluded.players,
          coaches = excluded.coaches,
          topic = excluded.topic,
          is_rumour = excluded.is_rumour,
          rumour_confidence = excluded.rumour_confidence,
          sentiment = excluded.sentiment,
          tags = excluded.tags,
          duplicate_of = excluded.duplicate_of,
          importance = excluded.importance,
          updated_at = datetime('now')
      `
    ).bind(
      article.id,
      article.title,
      article.description,
      article.source,
      article.sourceUrl,
      article.link,
      article.image ?? null,
      article.publishedAt,
      article.contentType,
      article.category ?? null,
      article.author ?? null,
      article.aiSummary ?? null,
      JSON.stringify(article.keyTakeaways ?? []),
      JSON.stringify(article.players ?? []),
      JSON.stringify(article.coaches ?? []),
      article.topic ?? null,
      article.isRumour ? 1 : 0,
      article.rumourConfidence ?? null,
      article.sentiment ?? null,
      JSON.stringify(article.tags ?? []),
      article.duplicateOf ?? null,
      article.importance ?? null
    )
  );

  await env.DB.batch(statements);
  return { saved: articles.length };
}

function rowToArticle(row: EnrichedContentRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    source: row.source,
    sourceUrl: row.source_url,
    link: row.link,
    image: row.image ?? undefined,
    publishedAt: row.published_at,
    contentType: row.content_type,
    category: row.category ?? undefined,
    author: row.author ?? undefined,
    aiSummary: row.ai_summary ?? undefined,
    keyTakeaways: parseJsonArray(row.key_takeaways),
    players: parseJsonArray(row.players),
    coaches: parseJsonArray(row.coaches),
    topic: row.topic ?? undefined,
    isRumour: Boolean(row.is_rumour),
    rumourConfidence: row.rumour_confidence ?? undefined,
    sentiment: row.sentiment ?? undefined,
    tags: parseJsonArray(row.tags),
    duplicateOf: row.duplicate_of,
    importance: row.importance ?? undefined,
  };
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function filterByTopic(articles: NewsArticle[], topic: NonNullable<NewsArticle['topic']>) {
  return articles.filter((article) => article.topic === topic);
}
