import { DOMParser } from 'linkedom';

export const HEALTH_PATHS = [
  '/',
  '/news',
  '/videos',
  '/podcasts',
  '/blogs',
  '/rumours',
  '/marlies',
  '/columns',
  '/standings',
  '/teams',
  '/team',
  '/players',
];

export type HealthLevel = 'ok' | 'warning' | 'problem';

export interface PageCheck {
  path: string;
  status: number | null;
  loadMs: number | null;
  title: string | null;
  hasDescription: boolean;
  canonical: string | null;
  h1Count: number;
  hasSchema: boolean;
  issues: string[];
  level: HealthLevel;
}

export interface SiteHealthReport {
  score: number;
  healthy: number;
  warnings: number;
  problems: number;
  https: boolean;
  sitemap: { ok: boolean; urls: number | null; detail: string };
  robots: { ok: boolean; detail: string };
  lastScan: string;
  recommendations: string[];
  pages: PageCheck[];
}

const TIMEOUT_MS = 8000;
const SLOW_MS = 1500;

async function fetchText(url: string): Promise<{ status: number | null; body: string; ms: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'TMLToday-HealthCheck' } });
    const body = await response.text();
    return { status: response.status, body, ms: Date.now() - started };
  } catch {
    return { status: null, body: '', ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

function checkPage(path: string, base: string): Promise<PageCheck> {
  return fetchText(`${base}${path}`).then(({ status, body, ms }) => {
    const issues: string[] = [];
    let title: string | null = null;
    let hasDescription = false;
    let canonical: string | null = null;
    let h1Count = 0;
    let hasSchema = false;

    if (status == null) {
      issues.push('Unreachable (timed out or network error)');
    } else if (status >= 400) {
      issues.push(`HTTP ${status}`);
    } else {
      if (ms > SLOW_MS) issues.push(`Slow response (${(ms / 1000).toFixed(2)}s)`);
      try {
        const doc = new DOMParser().parseFromString(body, 'text/html');
        title = doc.querySelector('title')?.textContent?.trim() || null;
        hasDescription = Boolean(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim());
        canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
        h1Count = doc.querySelectorAll('h1').length;
        hasSchema = doc.querySelectorAll('script[type="application/ld+json"]').length > 0;

        if (!title) issues.push('Missing <title>');
        else if (title.length < 10 || title.length > 65) issues.push(`Title length ${title.length} (aim 10–65)`);
        if (!hasDescription) issues.push('Missing meta description');
        if (!canonical) issues.push('Missing canonical link');
        if (h1Count === 0) issues.push('No H1 heading');
        else if (h1Count > 1) issues.push(`Multiple H1 headings (${h1Count})`);
        if (!hasSchema) issues.push('No structured data (JSON-LD)');
      } catch {
        issues.push('Could not parse HTML');
      }
    }

    const problem = status == null || (status ?? 0) >= 400 || h1Count === 0 || (status != null && !title);
    const level: HealthLevel = problem ? 'problem' : issues.length > 0 ? 'warning' : 'ok';
    return { path, status, loadMs: status == null ? null : ms, title, hasDescription, canonical, h1Count, hasSchema, issues, level };
  });
}

export async function runSiteHealth(base: string): Promise<SiteHealthReport> {
  const [pages, sitemapRes, robotsRes] = await Promise.all([
    Promise.all(HEALTH_PATHS.map((path) => checkPage(path, base))),
    fetchText(`${base}/sitemap.xml`),
    fetchText(`${base}/robots.txt`),
  ]);

  const sitemapUrls = sitemapRes.status === 200 ? (sitemapRes.body.match(/<loc>/g)?.length ?? 0) : null;
  const sitemap = {
    ok: sitemapRes.status === 200 && (sitemapUrls ?? 0) > 0,
    urls: sitemapUrls,
    detail: sitemapRes.status === 200 ? `OK (${sitemapUrls ?? 0} URLs)` : 'Missing — no sitemap.xml found',
  };

  const robotsReferencesSitemap = /sitemap/i.test(robotsRes.body);
  const robots = {
    ok: robotsRes.status === 200,
    detail: robotsRes.status === 200
      ? robotsReferencesSitemap ? 'OK, references sitemap' : 'OK, but no sitemap reference'
      : 'Missing — no robots.txt found',
  };

  const healthy = pages.filter((p) => p.level === 'ok').length;
  const warnings = pages.filter((p) => p.level === 'warning').length;
  const problems = pages.filter((p) => p.level === 'problem').length;

  let penalty = problems * 10 + warnings * 4;
  if (!sitemap.ok) penalty += 6;
  if (!robots.ok) penalty += 4;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    score,
    healthy,
    warnings,
    problems,
    https: base.startsWith('https://'),
    sitemap,
    robots,
    lastScan: new Date().toISOString(),
    recommendations: buildRecommendations(pages, sitemap, robots, problems),
    pages,
  };
}

function buildRecommendations(
  pages: PageCheck[],
  sitemap: SiteHealthReport['sitemap'],
  robots: SiteHealthReport['robots'],
  problems: number,
): string[] {
  const recs: string[] = [];

  const broken = pages.filter((p) => p.status == null || (p.status ?? 0) >= 400);
  if (broken.length) recs.push(`Fix ${broken.length} unreachable/erroring page${broken.length > 1 ? 's' : ''}: ${broken.map((p) => p.path).join(', ')}.`);

  const noH1 = pages.filter((p) => p.status != null && p.status < 400 && p.h1Count === 0);
  if (noH1.length) recs.push(`Add a single H1 heading to ${noH1.length} page${noH1.length > 1 ? 's' : ''}: ${noH1.map((p) => p.path).join(', ')}.`);

  if (!sitemap.ok) recs.push('Add a sitemap.xml so search engines can discover every page.');
  if (!robots.ok) recs.push('Add a robots.txt that references your sitemap.');

  const noDesc = pages.filter((p) => p.status != null && p.status < 400 && !p.hasDescription).length;
  if (noDesc) recs.push(`Write meta descriptions for ${noDesc} page${noDesc > 1 ? 's' : ''} to improve click-through from search.`);

  const noSchema = pages.filter((p) => p.status != null && p.status < 400 && !p.hasSchema).length;
  if (noSchema) recs.push(`Add JSON-LD structured data to ${noSchema} page${noSchema > 1 ? 's' : ''} for richer search results.`);

  const noCanonical = pages.filter((p) => p.status != null && p.status < 400 && !p.canonical).length;
  if (noCanonical) recs.push(`Set canonical links on ${noCanonical} page${noCanonical > 1 ? 's' : ''} to avoid duplicate-content issues.`);

  if (recs.length === 0 && problems === 0) recs.push('No major issues found. Keep publishing fresh, useful content.');
  return recs;
}
