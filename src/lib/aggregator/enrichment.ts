import { LEAFS_ROSTER } from '@/data/teams';
import { NewsArticle, Sentiment, StoryTopic } from '@/types';
import { getSourceByName } from './sources';

const COACHES = ['Craig Berube', 'Lane Lambert', 'Marc Savard', 'Mike Van Ryn', 'Curtis Sanford'];

const TOPIC_RULES: Array<{ topic: StoryTopic; terms: string[] }> = [
  { topic: 'breaking', terms: ['breaking', 'announces', 'official', 'confirmed'] },
  { topic: 'injury', terms: ['injury', 'injured', 'illness', 'day-to-day', 'out', 'questionable'] },
  { topic: 'trade', terms: ['trade', 'acquire', 'acquired', 'deal', 'waivers', 'signing', 'contract'] },
  { topic: 'rumour', terms: ['rumor', 'rumour', 'linked', 'could', 'might', 'speculation', 'insider'] },
  { topic: 'game', terms: ['game', 'preview', 'recap', 'highlights', 'vs.', 'versus', 'overtime'] },
  { topic: 'prospects', terms: ['prospect', 'marlies', 'ahl', 'draft', 'callup', 'call-up'] },
  { topic: 'roster', terms: ['lineup', 'lines', 'roster', 'pairing', 'practice'] },
  { topic: 'analysis', terms: ['analysis', 'breakdown', 'why', 'numbers', 'film', 'deep dive'] },
  { topic: 'media', terms: ['podcast', 'video', 'interview', 'radio', 'show'] },
];

const POSITIVE_TERMS = ['wins', 'win', 'surge', 'record', 'returns', 'strong', 'best', 'dominant', 'boost'];
const NEGATIVE_TERMS = ['loss', 'loses', 'injury', 'concern', 'struggle', 'bad', 'suspended', 'decline'];
const RUMOUR_TERMS = ['rumor', 'rumour', 'speculation', 'linked', 'believed', 'could', 'might', 'may', 'interest', 'insider'];

export function enrichArticle(article: NewsArticle, existing: NewsArticle[] = []): NewsArticle {
  const text = normalizeText(`${article.title} ${article.description}`);
  const sourceProfile = getSourceByName(article.source);
  const players = LEAFS_ROSTER.filter((player) => text.includes(player.name.toLowerCase())).map((player) => player.name);
  const coaches = COACHES.filter((coach) => text.includes(coach.toLowerCase()));
  const topic = classifyTopic(text, article.contentType);
  const isRumour = Boolean(sourceProfile?.rumourFocused) || topic === 'rumour' || RUMOUR_TERMS.some((term) => text.includes(term));
  const rumourConfidence = isRumour ? scoreRumourConfidence(text, article.source) : 0;
  const sentiment = assignSentiment(text);
  const duplicateOf = findDuplicate(article, existing);
  const tags = generateTags(article, players, coaches, topic, isRumour);
  const importance = rankImportance(article, topic, players.length, isRumour, duplicateOf);
  const keyTakeaways = generateTakeaways(article, players, coaches, topic, isRumour);

  return {
    ...article,
    aiSummary: summarize(article, topic, players),
    keyTakeaways,
    players,
    coaches,
    topic,
    isRumour,
    rumourConfidence,
    sentiment,
    tags,
    duplicateOf,
    importance,
    category: article.category ?? titleCase(topic),
  };
}

export function enrichArticles(articles: NewsArticle[]) {
  const enriched: NewsArticle[] = [];

  for (const article of articles) {
    enriched.push(enrichArticle(article, enriched));
  }

  return enriched.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
}

const MAX_SUMMARY_LENGTH = 300;

function summarize(article: NewsArticle, topic: StoryTopic, players: string[]) {
  const subject = players.length > 0 ? players.slice(0, 2).join(' and ') : 'the Maple Leafs';
  const source = article.source ? `${article.source} reports` : 'A new report says';
  const description = stripHtml(article.description).replace(/\s+/g, ' ').trim();
  const base = description || article.title;
  const summary = `${source} on ${topic.replace('-', ' ')} involving ${subject}. ${trimToSentence(base, 180)}`;

  // The lead-in is built from source/topic/player names, so it has no fixed width — cap the whole
  // summary rather than trusting the cap on the description alone.
  return trimToSentence(summary, MAX_SUMMARY_LENGTH);
}

function generateTakeaways(
  article: NewsArticle,
  players: string[],
  coaches: string[],
  topic: StoryTopic,
  isRumour: boolean
) {
  const takeaways = [`Topic classified as ${titleCase(topic)}.`];

  if (players.length > 0) takeaways.push(`Players mentioned: ${players.slice(0, 4).join(', ')}.`);
  if (coaches.length > 0) takeaways.push(`Coaches mentioned: ${coaches.join(', ')}.`);
  if (isRumour) takeaways.push('Treat as a rumour until confirmed by an official or primary source.');
  takeaways.push(`Source: ${article.source}.`);

  return takeaways.slice(0, 4);
}

function classifyTopic(text: string, contentType: NewsArticle['contentType']): StoryTopic {
  if (contentType === 'video' || contentType === 'podcast') return 'media';

  const match = TOPIC_RULES.find(({ terms }) => terms.some((term) => text.includes(term)));
  return match?.topic ?? 'analysis';
}

function assignSentiment(text: string): Sentiment {
  const positive = POSITIVE_TERMS.filter((term) => text.includes(term)).length;
  const negative = NEGATIVE_TERMS.filter((term) => text.includes(term)).length;

  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
}

function scoreRumourConfidence(text: string, sourceName: string) {
  const source = getSourceByName(sourceName);
  const sourceWeight = Math.min((source?.priority ?? 50) / 100, 0.95);
  const signalCount = RUMOUR_TERMS.filter((term) => text.includes(term)).length;
  const hedgePenalty = ['could', 'might', 'may'].some((term) => text.includes(term)) ? 0.12 : 0;
  const confirmationBoost = ['reported', 'according to', 'confirmed'].some((term) => text.includes(term)) ? 0.12 : 0;

  return clamp(Math.round((sourceWeight * 0.6 + signalCount * 0.08 + confirmationBoost - hedgePenalty) * 100), 15, 92);
}

function generateTags(
  article: NewsArticle,
  players: string[],
  coaches: string[],
  topic: StoryTopic,
  isRumour: boolean
) {
  const tags = new Set<string>([topic, article.contentType, article.source]);

  if (isRumour) tags.add('rumour-watch');
  players.forEach((player) => tags.add(player));
  coaches.forEach((coach) => tags.add(coach));

  return Array.from(tags).slice(0, 10);
}

function findDuplicate(article: NewsArticle, existing: NewsArticle[]) {
  const currentFingerprint = fingerprint(article.title);
  const dupe = existing.find((item) => {
    if (item.link === article.link) return true;
    const otherFingerprint = fingerprint(item.title);
    return similarity(currentFingerprint, otherFingerprint) >= 0.72;
  });

  return dupe?.id ?? null;
}

function rankImportance(
  article: NewsArticle,
  topic: StoryTopic,
  playerCount: number,
  isRumour: boolean,
  duplicateOf: string | null
) {
  const source = getSourceByName(article.source);
  const ageHours = Math.max((Date.now() - new Date(article.publishedAt).getTime()) / 3600000, 0);
  const sourceScore = source?.priority ?? 55;
  const topicBoost = topic === 'breaking' ? 24 : topic === 'trade' || topic === 'injury' ? 18 : topic === 'game' ? 12 : 6;
  const mediaBoost = article.contentType === 'video' || article.contentType === 'podcast' ? 4 : 0;
  const rumourBoost = isRumour ? 8 : 0;
  const freshnessPenalty = Math.min(ageHours * 1.8, 40);
  const duplicatePenalty = duplicateOf ? 18 : 0;

  return clamp(Math.round(sourceScore + topicBoost + playerCount * 5 + mediaBoost + rumourBoost - freshnessPenalty - duplicatePenalty), 1, 100);
}

function normalizeText(value: string) {
  return stripHtml(value).toLowerCase();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;\s]+;/g, ' ');
}

function trimToSentence(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength);
  const sentenceEnd = Math.max(trimmed.lastIndexOf('.'), trimmed.lastIndexOf('!'), trimmed.lastIndexOf('?'));
  return `${trimmed.slice(0, sentenceEnd > 80 ? sentenceEnd + 1 : trimmed.lastIndexOf(' ')).trim()}...`;
}

function fingerprint(value: string) {
  const stopWords = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'in', 'on', 'for', 'with', 'leafs', 'maple', 'toronto']);
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function similarity(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;

  const bSet = new Set(b);
  const intersection = a.filter((word) => bSet.has(word)).length;
  return intersection / Math.max(a.length, b.length);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
