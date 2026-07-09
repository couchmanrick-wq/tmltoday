import { NewsArticle } from '@/types';
import { saveEnrichedArticles } from './db';
import { enrichArticles } from './enrichment';
import { discoverArticles } from './scraper';

export interface AggregatorRunResult {
  discovered: number;
  enriched: number;
  saved: number;
  errors: Array<{ source: string; message: string }>;
}

export async function runAggregator(options: { persist?: boolean; limitPerSource?: number } = {}): Promise<AggregatorRunResult> {
  const { articles, errors } = await discoverArticles({ limitPerSource: options.limitPerSource ?? 8 });
  const enriched = enrichArticles(articles);
  const saveResult = options.persist === false ? { saved: 0 } : await saveEnrichedArticles(enriched);

  return {
    discovered: articles.length,
    enriched: enriched.length,
    saved: saveResult.saved,
    errors,
  };
}

export function personalizeFeed(articles: NewsArticle[], preferences: { players?: string[]; topics?: string[]; sources?: string[] }) {
  return [...articles].sort((a, b) => scorePersonalized(b, preferences) - scorePersonalized(a, preferences));
}

function scorePersonalized(article: NewsArticle, preferences: { players?: string[]; topics?: string[]; sources?: string[] }) {
  const players = new Set(preferences.players ?? []);
  const topics = new Set(preferences.topics ?? []);
  const sources = new Set(preferences.sources ?? []);
  const playerBoost = (article.players ?? []).filter((player) => players.has(player)).length * 12;
  const topicBoost = article.topic && topics.has(article.topic) ? 10 : 0;
  const sourceBoost = sources.has(article.source) ? 6 : 0;

  return (article.importance ?? 0) + playerBoost + topicBoost + sourceBoost;
}
