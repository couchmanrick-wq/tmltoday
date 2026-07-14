import { DOMParser } from 'linkedom';
import { NewsArticle } from '@/types';
import { AggregatorSource, AGGREGATOR_SOURCES } from './sources';

const LEAFS_TERMS = ['leafs', 'maple leafs', 'toronto maple leafs', 'marlies', 'auston matthews', 'mitch marner'];

// Team-tagged feeds are not reliably on-topic — the Toronto Sun "Maple Leafs" category feed, for
// one, carries Blue Jays copy. So every article, even from a leafsFocused source, has to look like
// hockey: if it mentions another sport and nothing hockey, it is dropped.
const HOCKEY_TERMS = [
  'leafs', 'maple leafs', 'marlies', 'nhl', 'ahl', 'hockey', 'puck', 'goalie', 'goaltender',
  'netminder', 'blueline', 'blue line', 'power play', 'penalty kill', 'faceoff', 'face-off',
  'defenceman', 'defenseman', 'winger', 'centreman', 'stanley cup', 'crease', 'zamboni',
  'shootout', 'overtime winner', 'hat trick', 'slapshot', 'icetime', 'ice time',
];

const OTHER_SPORT_TERMS = [
  'blue jays', 'jays', 'raptors', 'argonauts', 'argos', 'toronto fc', 'mlb', 'nba', 'nfl', 'cfl',
  'wnba', 'mls', 'baseball', 'basketball', 'soccer', 'golf', 'tennis', 'nascar', 'formula 1',
  'ufc', 'boxing', 'cricket', 'rugby',
];

const HOCKEY_PATTERN = buildTermPattern(HOCKEY_TERMS);
const OTHER_SPORT_PATTERN = buildTermPattern(OTHER_SPORT_TERMS);

function buildTermPattern(terms: string[]) {
  return new RegExp(`\\b(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');
}

function isHockeyRelevant(article: NewsArticle) {
  const text = `${article.title} ${article.description}`;
  if (HOCKEY_PATTERN.test(text)) return true;

  return !OTHER_SPORT_PATTERN.test(text);
}

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
        author: readAuthor(item, source.name),
        publishedAt: normalizeDate(publishedAt),
      });
    })
    .filter((article): article is NewsArticle => Boolean(article))
    .filter((article) => source.leafsFocused || isLeafsRelevant(article))
    .filter(isHockeyRelevant)
    .slice(0, limit);
}

async function scrapeLandingPage(source: AggregatorSource, limit: number): Promise<NewsArticle[]> {
  const response = await fetch(source.url, {
    headers: { 'user-agent': 'TMLtodayBot/1.0 (+https://tmltoday.com)' },
  });

  if (!response.ok) throw new Error(`Page returned ${response.status}`);

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  const structuredCandidates = source.id === 'blogto'
    ? [...document.querySelectorAll('a.article-thumbnail-link')]
        .map((anchor) => {
          const href = anchor.getAttribute('href');
          const card = anchor.parentElement;
          const title = normalizeWhitespace(card?.querySelector('.article-thumbnail-title-text')?.textContent ?? '');
          if (!href || !title) return null;

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
        .filter(isLeafsRelevant)
        .filter(isHockeyRelevant)
    : [];
  const candidates = [...document.querySelectorAll('a')]
    .map((anchor) => {
      const href = anchor.getAttribute('href');
      // The length floor is checked against the raw link text, so that a short headline followed by
      // a long blurb still clears the bar that filters out nav/chrome links.
      const rawTitle = normalizeWhitespace(anchor.textContent ?? '');
      if (!href || rawTitle.length < 24) return null;

      const title = cleanTitle(rawTitle);
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
    .filter((article) => source.leafsFocused || isLeafsRelevant(article))
    .filter(isHockeyRelevant);

  return dedupeByUrl([...structuredCandidates, ...candidates]).slice(0, limit);
}

const MAX_TITLE_LENGTH = 130;

// Podcast index cards run the headline into the publication stamp and the episode blurb, e.g.
// "Time to Tank Mar 12 2026 42 mins It's no longer speculation...". Cut from the date onwards, so
// only the headline survives.
const EPISODE_STAMP =
  /\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b[\s\S]*$/i;

// Only these run-on card texts get the stamp treatment. A real headline is short and may legitimately
// contain a date, and we must not cut "Leafs to retire Sundin's number on Jan 29 2026" down to a stub.
const RUN_ON_LENGTH = 90;

// A card that renders its headline twice (a visible copy plus a screen-reader one) comes back from
// textContent doubled, often with player chrome trailing it. Find the headline repeated back to
// back and keep a single copy, dropping whatever followed.
function collapseRepeatedTitle(value: string) {
  for (let length = Math.floor(value.length / 2); length >= 20; length -= 1) {
    if (value.slice(0, length) === value.slice(length, length * 2)) {
      return value.slice(0, length);
    }
  }

  return value;
}

function truncateTitle(value: string) {
  if (value.length <= MAX_TITLE_LENGTH) return value;

  const cut = value.slice(0, MAX_TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > MAX_TITLE_LENGTH * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${trimmed.replace(/[\s,;:.–—-]+$/, '')}…`;
}

const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\.?';

// Card link text also picks up the furniture printed around the headline: the byline above it and
// the section/date line below, neither separated by whitespace once textContent flattens the markup.
// e.g. "by Michael CoyleCraig Berube likes the Leafs' moves...News - Jul 9, 2026".
const SECTION = '(?:News|Editorials?|Opinions?|Analysis|Features?|Videos?|Podcasts?)';
const DATE = `${MONTH}\\s+\\d{1,2},?\\s+\\d{4}`;

const LEADING_BYLINE = /^by\s+[A-Z][a-zA-Z.'’-]*(?:\s+[A-Z][a-zA-Z.'’-]*)*(?=[A-Z])/;
// The section and date arrive together ("...Nick Paul?Editorials - Jul 10, 2026"), so they come off
// together — strip the date first and the orphaned section no longer has the dash that identifies it.
const TRAILING_SECTION_DATE = new RegExp(`${SECTION}\\s*[\\u2013\\u2014-]\\s*${DATE}\\.?$`, 'i');
const TRAILING_DATE = new RegExp(`[\\s,\\u2013\\u2014-]*${DATE}\\.?$`, 'i');

// Real headlines get this short ("Time to Tank"), so the floor only guards against a strip that
// leaves nothing usable behind.
const MIN_CLEAN_TITLE_LENGTH = 10;

const applyIfSubstantial = (value: string, pattern: RegExp) => {
  const stripped = value.replace(pattern, '').trim();
  return stripped.length >= MIN_CLEAN_TITLE_LENGTH ? stripped : value;
};

function cleanTitle(value: string) {
  let title = collapseRepeatedTitle(normalizeWhitespace(stripHtml(value)));

  title = applyIfSubstantial(title, LEADING_BYLINE);

  // Trailing furniture comes off before the run-on cut below: that cut also keys on a date, and if
  // it ran first it would consume the trailing date and strand the section label ("...News -").
  title = applyIfSubstantial(title, TRAILING_SECTION_DATE);
  title = applyIfSubstantial(title, TRAILING_DATE);

  // What is left can still be an episode blurb running on mid-string. Cutting from the date onwards
  // would eat a legitimate headline that merely mentions one, so only run-on card text qualifies.
  if (title.length > RUN_ON_LENGTH) {
    title = applyIfSubstantial(title, EPISODE_STAMP);
  }

  return truncateTitle(title);
}

function normalizeArticle(article: NewsArticle): NewsArticle {
  return {
    ...article,
    title: cleanTitle(article.title),
    description: normalizeWhitespace(stripHtml(article.description)),
    link: article.link.split('#')[0],
  };
}

function readText(node: Element, selector: string) {
  return normalizeWhitespace(node.querySelector(selector)?.textContent ?? '');
}

/**
 * The byline, wherever the feed keeps it: RSS puts it in `dc:creator` (or an `author` element that
 * is often just an email address), Atom nests it in `author > name`. A byline that merely repeats
 * the publication is not worth showing beside it.
 */
function readAuthor(item: Element, sourceName: string) {
  const candidates = [
    ...[...item.children]
      .filter((child) => {
        const tag = child.nodeName.toLowerCase();
        return tag === 'dc:creator' || tag === 'creator';
      })
      .map((child) => child.textContent ?? ''),
    item.querySelector('author > name')?.textContent ?? '',
    item.querySelector('author')?.textContent ?? '',
  ];

  for (const candidate of candidates) {
    const author = normalizeWhitespace(stripHtml(candidate));

    // Some feeds put a bare email in <author>; that is not a byline.
    if (!author || author.length > 60 || author.includes('@')) continue;
    if (author.toLowerCase() === sourceName.toLowerCase()) continue;

    return author;
  }

  return undefined;
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
