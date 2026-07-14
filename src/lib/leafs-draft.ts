import { getCloudflareContext } from '@opennextjs/cloudflare';

const NHL_API = 'https://api-web.nhle.com/v1';

export interface DraftPick {
  round: number;
  overall: number;
  pickInRound: number;
  name: string;
  position: string;
  club: string | null;
  league: string | null;
}

export interface DraftYear {
  year: number;
  picks: DraftPick[];
}

interface NhlDraftPick {
  round?: number;
  pickInRound?: number;
  overallPick?: number;
  teamAbbrev?: string;
  firstName?: { default?: string };
  lastName?: { default?: string };
  positionCode?: string;
  amateurLeague?: { default?: string };
  amateurClubName?: { default?: string };
}

interface NhlDraftYearResponse {
  draftYears?: number[];
  picks?: NhlDraftPick[];
}

async function getJson<T>(url: string, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      // Bypass the framework fetch cache — a single poisoned entry would otherwise persist for days.
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return (await response.json()) as T;
    } catch {
      // retry
    }
    if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 250 * (i + 1)));
  }
  return null;
}

// Resolve promises in small batches to stay gentle on the NHL API and avoid rate-limit drops.
async function mapWithConcurrency<TIn, TOut>(items: TIn[], limit: number, fn: (item: TIn) => Promise<TOut>): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function toLeafsPicks(response: NhlDraftYearResponse | null): DraftPick[] {
  return (response?.picks ?? [])
    .filter((pick) => pick.teamAbbrev === 'TOR')
    .map((pick) => ({
      round: pick.round ?? 0,
      overall: pick.overallPick ?? 0,
      pickInRound: pick.pickInRound ?? 0,
      name: `${pick.firstName?.default ?? ''} ${pick.lastName?.default ?? ''}`.trim() || 'Unknown',
      position: pick.positionCode ?? '—',
      club: pick.amateurClubName?.default?.trim() || null,
      league: pick.amateurLeague?.default?.trim() || null,
    }))
    .sort((a, b) => a.overall - b.overall);
}

let memo: { at: number; data: DraftYear[] } | null = null;
const MEMO_TTL_MS = 6 * 60 * 60 * 1000;

export async function getLeafsDraftPicks(): Promise<DraftYear[]> {
  if (memo && memo.data.length > 0 && Date.now() - memo.at < MEMO_TTL_MS) return memo.data;

  const seedYear = new Date().getFullYear();
  const index =
    (await getJson<NhlDraftYearResponse>(`${NHL_API}/draft/picks/${seedYear}/all`)) ??
    (await getJson<NhlDraftYearResponse>(`${NHL_API}/draft/picks/${seedYear - 1}/all`));
  const years = index?.draftYears ?? [];
  if (years.length === 0) return [];

  const responses = await mapWithConcurrency(years, 8, (year) =>
    getJson<NhlDraftYearResponse>(`${NHL_API}/draft/picks/${year}/all`),
  );

  const data = years
    .map((year, i) => ({ year, picks: toLeafsPicks(responses[i]) }))
    .filter((entry) => entry.picks.length > 0)
    .sort((a, b) => b.year - a.year);

  if (data.length > 0) memo = { at: Date.now(), data };
  return data;
}

// ---- Persistence: the draft history is 48 live subrequests, well over what a single page render
// can afford on Workers, so it is stored in D1 and refreshed by the daily cron. ----

interface DraftPickRow {
  year: number;
  overall: number;
  round: number;
  pick_in_round: number;
  name: string;
  position: string | null;
  club: string | null;
  league: string | null;
}

export async function getStoredDraftPicks(): Promise<DraftYear[]> {
  try {
    const { env } = getCloudflareContext();
    const { results } = await env.DB.prepare(
      `SELECT year, overall, round, pick_in_round, name, position, club, league FROM draft_picks ORDER BY year DESC, overall ASC`,
    ).all<DraftPickRow>();
    const byYear = new Map<number, DraftPick[]>();
    for (const row of results) {
      if (!byYear.has(row.year)) byYear.set(row.year, []);
      byYear.get(row.year)!.push({
        round: row.round,
        overall: row.overall,
        pickInRound: row.pick_in_round,
        name: row.name,
        position: row.position ?? '—',
        club: row.club,
        league: row.league,
      });
    }
    return [...byYear.entries()].map(([year, picks]) => ({ year, picks }));
  } catch {
    return [];
  }
}

export async function reviewDraftPicks(): Promise<{ years: number; picks: number }> {
  const { env } = getCloudflareContext();
  const data = await getLeafsDraftPicks();
  const totalPicks = data.reduce((sum, y) => sum + y.picks.length, 0);
  if (totalPicks === 0) return { years: 0, picks: 0 };

  // Upsert so a re-review never wipes the resolved player_id column (past drafts don't change).
  const statements = [];
  for (const { year, picks } of data) {
    for (const p of picks) {
      statements.push(
        env.DB.prepare(
          `INSERT INTO draft_picks (year, overall, round, pick_in_round, name, position, club, league) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(year, overall) DO UPDATE SET round=excluded.round, pick_in_round=excluded.pick_in_round, name=excluded.name, position=excluded.position, club=excluded.club, league=excluded.league`,
        ).bind(year, p.overall, p.round, p.pickInRound, p.name, p.position, p.club, p.league),
      );
    }
  }
  await env.DB.batch(statements);
  return { years: data.length, picks: totalPicks };
}

// ---- Draft -> prospect resolution: map recent picks to their NHL player IDs so the prospect
// review can evaluate every new draftee automatically (no hand-maintained seed). The NHL search
// is one subrequest per pick, so we resolve in bounded batches from the daily cron. ----

const RESOLVE_WITHIN_YEARS = 7; // resolve IDs for picks this recent (candidates for "under 23")
const PROSPECT_DRAFT_WITHIN_YEARS = 5; // only picks this recent can still be under 23

async function searchPlayerId(name: string): Promise<number | null> {
  const res = await getJson<Array<{ playerId?: string | number; name?: string }>>(
    `https://search.d3.nhle.com/api/v1/search/player?culture=en-us&q=${encodeURIComponent(name)}`,
  );
  if (!res || res.length === 0) return null;
  const hit = res.find((r) => r.name?.toLowerCase() === name.toLowerCase()) ?? res[0];
  const id = Number(hit.playerId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function resolveDraftPlayerIds(limit = 30): Promise<{ resolved: number; remaining: number }> {
  const { env } = getCloudflareContext();
  const minYear = new Date().getFullYear() - RESOLVE_WITHIN_YEARS;
  const { results } = await env.DB.prepare(
    `SELECT year, overall, name FROM draft_picks WHERE player_id IS NULL AND year >= ? ORDER BY year DESC, overall ASC LIMIT ?`,
  ).bind(minYear, limit).all<{ year: number; overall: number; name: string }>();

  const statements = [];
  for (const row of results) {
    const id = await searchPlayerId(row.name); // bad/no matches stored as 0 so we don't retry forever
    statements.push(env.DB.prepare(`UPDATE draft_picks SET player_id = ? WHERE year = ? AND overall = ?`).bind(id ?? 0, row.year, row.overall));
  }
  if (statements.length > 0) await env.DB.batch(statements);

  const rem = await env.DB.prepare(`SELECT COUNT(*) c FROM draft_picks WHERE player_id IS NULL AND year >= ?`).bind(minYear).first<{ c: number }>();
  return { resolved: statements.length, remaining: Number(rem?.c ?? 0) };
}

// NHL player IDs of recent draft picks — candidates the prospect review filters by live landing data.
export async function getRecentDraftProspectIds(): Promise<number[]> {
  try {
    const { env } = getCloudflareContext();
    const minYear = new Date().getFullYear() - PROSPECT_DRAFT_WITHIN_YEARS;
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT player_id FROM draft_picks WHERE player_id IS NOT NULL AND player_id > 0 AND year >= ?`,
    ).bind(minYear).all<{ player_id: number }>();
    return results.map((r) => r.player_id);
  } catch {
    return [];
  }
}
