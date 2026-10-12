// Cached NHL API fetch for the live score routes. The NHL API rate-limits (429) when every page view hits
// it directly, so responses are kept in the Workers edge cache for `ttl` seconds, and the last good copy
// is served if the NHL API errors.
const STALE_SECONDS = 60 * 60 * 24;

function edgeCache(): Cache | null {
  return typeof caches !== 'undefined' ? (caches as unknown as { default: Cache }).default : null;
}

export async function nhlJson<T = unknown>(url: string, ttl: number): Promise<T> {
  const cache = edgeCache();
  const freshKey = new Request(`https://nhl-cache.tmltoday.invalid/fresh?u=${encodeURIComponent(url)}`);
  const staleKey = new Request(`https://nhl-cache.tmltoday.invalid/stale?u=${encodeURIComponent(url)}`);

  const fresh = cache ? await cache.match(freshKey).catch(() => undefined) : undefined;
  if (fresh) return (await fresh.json()) as T;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`NHL API ${response.status}: ${url}`);
    const body = await response.text();

    if (cache) {
      const put = (key: Request, seconds: number) =>
        cache
          .put(key, new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${seconds}` } }))
          .catch(() => undefined);
      await Promise.all([put(freshKey, ttl), put(staleKey, STALE_SECONDS)]);
    }

    return JSON.parse(body) as T;
  } catch (error) {
    const stale = cache ? await cache.match(staleKey).catch(() => undefined) : undefined;
    if (stale) return (await stale.json()) as T;
    throw error;
  }
}
