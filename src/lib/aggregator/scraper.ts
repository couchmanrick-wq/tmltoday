import { DOMParser } from 'linkedom';
import { NewsArticle } from '@/types';
import { AggregatorSource, AGGREGATOR_SOURCES } from './sources';

const LEAFS_TERMS = ['leafs', 'maple leafs', 'toronto maple leafs', 'marlies', 'auston matthews', 'mitch marner'];

export interface ScrapeResult {
  articles: NewsArticle[];
  errors: Array<{ source: string; message: string }>;
}

export async function discoverArticles(options: { limitPerSource?: number; sources?: AggregatorSource[] } = {}): Promise<ScrapeResult> {
  const sources = options.sources ?? AGGREGATOR_SOURCES;
  const limitPerSource = options.limitPerSource ?? 8;
  const settled = await Promise.allSettled(sources.map((source) => discoverSource(source, limitPerSource)));
  const articles: NewsArticle[] = [];
  const errors: ScrapeResult['errors'] = [];

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    } else {
      errors.push({ source: sources[index].name, message: result.reason instanceof Error ? result.reason.message : 'Unknown error' });
    }
  });

  return { articles: dedupeByUrl(articles), errors };
}

async function discoverSource(source: AggregatorSource, limit: number) {
  if (source.feedUrl) {
    return fetchFeed(source, limit);
  }

  return scrapeLandingPage(source, limit);
}

async function fetchFeed(source: AggregatorSource, limit: number): Promise<NewsArticle[]> {
  const response = await fetch(source.feedUrl!, {
    headers: { 'user-agent': 'TMLtodayBot/1.0 (+https://tmltoday.com)' },
  });

  if (!response.ok) throw new Error(`Feed returned ${response.status}`);

  const xml = await response.text();
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  const itemNodes = [...document.querySelectorAll('item, entry')].slice(0, limit * 2);

  return itemNodes
    .map((item) => {
      const title = readText(item, 'title');
      const link = readLink(item);
      const description = readText(item, 'description') || readText(item, 'summary') || readText(item, 'content');
      const publishedAt = readText(item, 'pubDate') || readText(item, 'published') || readText(item, 'updated');

      if (!title || !link) return null;

      return normalizeArticle({
        id: stableId(link),
        title,
        description: description || title,
        source: source.name,
        sourceUrl: source.url,
        link,
        contentType: source.contentType,
        publishedAt: normalizeDate(publishedAt),
      });
    })
    .filter((article): article is NewsArticle => Boolean(article))
    .filter(isLeafsRelevant)
    .slice(0, limit);
}

async function scrapeLandingPage(source: AggregatorSource, limit: number): Promise<NewsArticle[]> {
  const response = await fetch(source.url, {
    headers: { 'user-agent': 'TMLtodayBot/1.0 (+https://tmltoday.com)' },
  });

  if (!response.ok) throw new Error(`Page returned ${response.status}`);

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  const candidates = [...document.querySelectorAll('a')]
    .map((anchor) => {
      const href = anchor.getAttribute('href');
      const title = normalizeWhitespace(anchor.textContent ?? '');
      if (!href || title.length < 24) return null;

      const link = new URL(href, source.url).toString();

      return normalizeArticle({
        id: stableId(link),
        title,
        description: title,
        source: source.name,
        sourceUrl: source.url,
        link,
        contentType: source.contentType,
        publishedAt: new Date().toISOString(),
      });
    })
    .filter((article): article is NewsArticle => Boolean(article))
    .filter(isLeafsRelevant);

  return dedupeByUrl(candidates).slice(0, limit);
}

function normalizeArticle(article: NewsArticle): NewsArticle {
  return {
    ...article,
    title: normalizeWhitespace(stripHtml(article.title)),
    description: normalizeWhitespace(stripHtml(article.description)),
    link: article.link.split('#')[0],
  };
}

function readText(node: Element, selector: string) {
  return normalizeWhitespace(node.querySelector(selector)?.textContent ?? '');
}

function readLink(node: Element) {
  const atomLink = node.querySelector('link[href]')?.getAttribute('href');
  return normalizeWhitespace(atomLink || node.querySelector('link')?.textContent || node.querySelector('guid')?.textContent || '');
}

function isLeafsRelevant(article: NewsArticle) {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return LEAFS_TERMS.some((term) => text.includes(term));
}

function normalizeDate(value?: string) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;\s]+;/g, ' ');
}

function dedupeByUrl(articles: NewsArticle[]) {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.link)) return false;
    seen.add(article.link);
    return true;
  });
}

function stableId(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }

  return `story-${(hash >>> 0).toString(36)}`;
}
