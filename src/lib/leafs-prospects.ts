import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getRecentDraftProspectIds } from './leafs-draft';

const NHL_API = 'https://api-web.nhle.com/v1';

// A prospect is under 23 AND not an established NHLer (fewer than 50 NHL games this season).
export const PROSPECT_AGE_LIMIT = 23; // strictly under 23
export const PROSPECT_GP_LIMIT = 50; // fewer than 50 NHL games in the current season

// Verified NHL player IDs of drafted/signed Leafs-system players to cross-reference beyond the
// (often sparse) NHL prospects feed — mostly recent draft picks (see scripts/resolve prospects),
// plus undrafted signings. Live landing data arbitrates every one: a player is only listed while
// the API still reports currentTeamAbbrev === 'TOR' and they clear the age/GP threshold, so anyone
// traded away, aged out, or promoted to an NHL regular drops automatically. Add new draftees here.
const SEED_PROSPECT_IDS = [
  8485115, // Borya Valis (undrafted signing)
  8483492, // Nicholas Moldenhauer (2022 draft)
  8484438, // Hudson Malinoski (2023)
  8484464, // Noah Chadwick (2023)
  8485029, // Victor Johansson (2024)
  8485049, // Miroslav Holinka (2024)
  8485050, // Alexander Plesovskikh (2024)
  8485046, // Timofei Obvintsev (2024)
  8485107, // Sam McCue (2024)
  8485564, // Tinus Luc Koblar (2025)
  8485398, // Tyler Hopkins (2025)
  8485428, // William Belle (2025)
  8485622, // Harry Nansi (2025)
  8485655, // Rylan Fellinger (2025)
  8486067, // Gavin McKenna (2026)
  8486024, // Alexander Bilecki (2026)
  8485789, // Ethan MacKenzie (2026)
  8486076, // Zach Olsen (2026)
  8486040, // Mans Gudmundsson (2026)
  8486235, // Juuso Ainasto (2026)
  8486253, // Patriks Plumins (2026)
  8486114, // Cooper Williams (2026)
  8486296, // Yaroslav Fedoseyev (2026)
  8486300, // Brody Pepoy (2026)
];

export interface CareerStatLine {
  season: number;
  seasonLabel: string;
  league: string;
  team: string;
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  points?: number;
  wins?: number;
  savePctg?: number;
  goalsAgainstAvg?: number;
}

export interface LeafProspect {
  id: number;
  name: string;
  position: string;
  isGoalie: boolean;
  age: number | null;
  currentClub: string | null;
  currentLeague: string | null;
  nhlGamesPlayed: number;
  headshot: string | null;
  career: CareerStatLine[];
}

export interface RosterPlayer {
  id: number;
  name: string;
  position: string;
  number: number | null;
  age: number | null;
  gamesPlayed: number;
  height: string | null;
  weight: string | null;
  headshot: string | null;
}

export interface LeafsRoster {
  season: number;
  players: RosterPlayer[];
}

interface NhlRosterPlayer {
  id: number;
  headshot?: string;
  firstName?: { default?: string };
  lastName?: { default?: string };
  sweaterNumber?: number;
  positionCode?: string;
  heightInInches?: number;
  weightInPounds?: number;
  birthDate?: string;
}

interface NhlSeasonTotal {
  season?: number;
  gameTypeId?: number;
  leagueAbbrev?: string;
  teamName?: { default?: string };
  gamesPlayed?: number;
  goals?: number;
  assists?: number;
  points?: number;
  wins?: number;
  savePctg?: number;
  goalsAgainstAvg?: number;
}

interface NhlLanding {
  playerId: number;
  currentTeamAbbrev?: string;
  firstName?: { default?: string };
  lastName?: { default?: string };
  sweaterNumber?: number;
  position?: string;
  headshot?: string;
  heightInInches?: number;
  weightInPounds?: number;
  birthDate?: string;
  seasonTotals?: NhlSeasonTotal[];
}

type RosterGroups = Partial<Record<'forwards' | 'defensemen' | 'goalies', NhlRosterPlayer[]>>;

export function isProspect(age: number | null, nhlGamesPlayed: number) {
  return age != null && age < PROSPECT_AGE_LIMIT && nhlGamesPlayed < PROSPECT_GP_LIMIT;
}

export function seasonLabel(season: number): string {
  const value = String(season);
  return value.length === 8 ? `${value.slice(0, 4)}–${value.slice(6)}` : value;
}

function computeAge(birthDate?: string, reference = new Date()): number | null {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  let age = reference.getFullYear() - dob.getFullYear();
  const monthDiff = reference.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < dob.getDate())) age -= 1;
  return age;
}

function formatHeight(inches?: number): string | null {
  if (!inches) return null;
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 21600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const flattenRoster = (groups: RosterGroups | null) =>
  groups ? [...(groups.forwards ?? []), ...(groups.defensemen ?? []), ...(groups.goalies ?? [])] : [];

export async function getLeafsRoster(): Promise<LeafsRoster> {
  const [rosterGroups, clubStats] = await Promise.all([
    getJson<RosterGroups>(`${NHL_API}/roster/TOR/current`),
    getJson<{ season?: number; skaters?: Array<{ playerId: number; gamesPlayed?: number }>; goalies?: Array<{ playerId: number; gamesPlayed?: number }> }>(`${NHL_API}/club-stats/TOR/now`),
  ]);

  const gpById = new Map<number, number>();
  for (const s of clubStats?.skaters ?? []) gpById.set(s.playerId, s.gamesPlayed ?? 0);
  for (const g of clubStats?.goalies ?? []) gpById.set(g.playerId, g.gamesPlayed ?? 0);

  const players: RosterPlayer[] = flattenRoster(rosterGroups).map((p) => ({
    id: p.id,
    name: `${p.firstName?.default ?? ''} ${p.lastName?.default ?? ''}`.trim(),
    position: p.positionCode ?? '—',
    number: p.sweaterNumber ?? null,
    age: computeAge(p.birthDate),
    gamesPlayed: gpById.get(p.id) ?? 0,
    height: formatHeight(p.heightInInches),
    weight: p.weightInPounds ? `${p.weightInPounds} lbs` : null,
    headshot: p.headshot ?? null,
  }));

  return { season: clubStats?.season ?? 20252026, players };
}

function buildProspect(landing: NhlLanding, currentSeason: number): LeafProspect | null {
  const age = computeAge(landing.birthDate);
  const position = landing.position ?? '—';
  const isGoalie = position === 'G';

  const regularSeason = (landing.seasonTotals ?? []).filter((s) => s.gameTypeId === 2 && s.teamName?.default);

  const nhlGamesPlayed = regularSeason
    .filter((s) => s.season === currentSeason && s.leagueAbbrev === 'NHL')
    .reduce((sum, s) => sum + (s.gamesPlayed ?? 0), 0);

  if (!isProspect(age, nhlGamesPlayed)) return null;

  // Current club = the team with the most regular-season games in the current season.
  const currentSeasonLines = regularSeason.filter((s) => s.season === currentSeason);
  const currentLine = currentSeasonLines.sort((a, b) => (b.gamesPlayed ?? 0) - (a.gamesPlayed ?? 0))[0];

  const career: CareerStatLine[] = regularSeason
    .map((s) => ({
      season: s.season ?? 0,
      seasonLabel: seasonLabel(s.season ?? 0),
      league: s.leagueAbbrev ?? '—',
      team: s.teamName?.default ?? '—',
      gamesPlayed: s.gamesPlayed ?? 0,
      ...(isGoalie
        ? { wins: s.wins, savePctg: s.savePctg, goalsAgainstAvg: s.goalsAgainstAvg }
        : { goals: s.goals, assists: s.assists, points: s.points }),
    }))
    .sort((a, b) => a.season - b.season);

  return {
    id: landing.playerId,
    name: `${landing.firstName?.default ?? ''} ${landing.lastName?.default ?? ''}`.trim(),
    position,
    isGoalie,
    age,
    currentClub: currentLine?.teamName?.default ?? null,
    currentLeague: currentLine?.leagueAbbrev ?? null,
    nhlGamesPlayed,
    headshot: landing.headshot ?? null,
    career,
  };
}

export interface ProspectProfile {
  id: number;
  name: string;
  position: string;
  isGoalie: boolean;
  shoots: string | null;
  age: number | null;
  birthDate: string | null;
  birthplace: string | null;
  height: string | null;
  weight: string | null;
  number: number | null;
  headshot: string | null;
  heroImage: string | null;
  draft: { year: number; round: number; overall: number; pickInRound: number; team: string } | null;
  currentClub: string | null;
  currentLeague: string | null;
  nhlGamesPlayed: number;
  career: CareerStatLine[];
}

export async function getProspectProfile(id: number): Promise<ProspectProfile | null> {
  const landing = await getJson<NhlLanding & {
    heroImage?: string;
    shootsCatches?: string;
    sweaterNumber?: number;
    birthCity?: { default?: string };
    birthStateProvince?: { default?: string };
    birthCountry?: string;
    draftDetails?: { year?: number; round?: number; pickInRound?: number; overallPick?: number; teamAbbrev?: string };
  }>(`${NHL_API}/player/${id}/landing`);
  if (!landing) return null;

  const position = landing.position ?? '—';
  const isGoalie = position === 'G';
  const clubStats = await getJson<{ season?: number }>(`${NHL_API}/club-stats/TOR/now`);
  const currentSeason = clubStats?.season ?? 20252026;

  const regularSeason = (landing.seasonTotals ?? []).filter((s) => s.gameTypeId === 2 && s.teamName?.default);
  const nhlGamesPlayed = regularSeason
    .filter((s) => s.season === currentSeason && s.leagueAbbrev === 'NHL')
    .reduce((sum, s) => sum + (s.gamesPlayed ?? 0), 0);
  const currentLine = regularSeason.filter((s) => s.season === currentSeason).sort((a, b) => (b.gamesPlayed ?? 0) - (a.gamesPlayed ?? 0))[0];

  const career: CareerStatLine[] = regularSeason
    .map((s) => ({
      season: s.season ?? 0,
      seasonLabel: seasonLabel(s.season ?? 0),
      league: s.leagueAbbrev ?? '—',
      team: s.teamName?.default ?? '—',
      gamesPlayed: s.gamesPlayed ?? 0,
      ...(isGoalie
        ? { wins: s.wins, savePctg: s.savePctg, goalsAgainstAvg: s.goalsAgainstAvg }
        : { goals: s.goals, assists: s.assists, points: s.points }),
    }))
    .sort((a, b) => a.season - b.season);

  const draft = landing.draftDetails?.year
    ? {
        year: landing.draftDetails.year,
        round: landing.draftDetails.round ?? 0,
        overall: landing.draftDetails.overallPick ?? 0,
        pickInRound: landing.draftDetails.pickInRound ?? 0,
        team: landing.draftDetails.teamAbbrev ?? '—',
      }
    : null;

  const birthplace = [landing.birthCity?.default, landing.birthStateProvince?.default, landing.birthCountry].filter(Boolean).join(', ') || null;

  return {
    id: landing.playerId,
    name: `${landing.firstName?.default ?? ''} ${landing.lastName?.default ?? ''}`.trim(),
    position,
    isGoalie,
    shoots: landing.shootsCatches ?? null,
    age: computeAge(landing.birthDate),
    birthDate: landing.birthDate ?? null,
    birthplace,
    height: formatHeight(landing.heightInInches),
    weight: landing.weightInPounds ? `${landing.weightInPounds} lbs` : null,
    number: landing.sweaterNumber ?? null,
    headshot: landing.headshot ?? null,
    heroImage: landing.heroImage ?? null,
    draft,
    currentClub: currentLine?.teamName?.default ?? null,
    currentLeague: currentLine?.leagueAbbrev ?? null,
    nhlGamesPlayed,
    career,
  };
}

export async function computeProspects(): Promise<LeafProspect[]> {
  const [rosterGroups, prospectGroups, clubStats] = await Promise.all([
    getJson<RosterGroups>(`${NHL_API}/roster/TOR/current`),
    getJson<RosterGroups>(`${NHL_API}/prospects/TOR`),
    getJson<{ season?: number; skaters?: Array<{ playerId: number; gamesPlayed?: number }>; goalies?: Array<{ playerId: number; gamesPlayed?: number }> }>(`${NHL_API}/club-stats/TOR/now`),
  ]);
  const currentSeason = clubStats?.season ?? 20252026;

  const gpById = new Map<number, number>();
  for (const s of clubStats?.skaters ?? []) gpById.set(s.playerId, s.gamesPlayed ?? 0);

  const candidateIds = new Set<number>(SEED_PROSPECT_IDS);
  // Recent draft picks resolved to NHL IDs by the cron — the self-maintaining source.
  for (const id of await getRecentDraftProspectIds()) candidateIds.add(id);
  // Young roster players (traded/signed rookies, undrafted signings) who could be prospects.
  for (const p of flattenRoster(rosterGroups)) {
    const age = computeAge(p.birthDate);
    if (age != null && age < PROSPECT_AGE_LIMIT && (gpById.get(p.id) ?? 0) < PROSPECT_GP_LIMIT) candidateIds.add(p.id);
  }
  // Anyone the NHL prospects feed lists who is still young.
  for (const p of flattenRoster(prospectGroups)) {
    const age = computeAge(p.birthDate);
    if (age != null && age < PROSPECT_AGE_LIMIT) candidateIds.add(p.id);
  }

  const landings = await Promise.all([...candidateIds].map((id) => getJson<NhlLanding>(`${NHL_API}/player/${id}/landing`)));

  const prospects: LeafProspect[] = [];
  for (const landing of landings) {
    if (!landing || landing.currentTeamAbbrev !== 'TOR') continue;
    const prospect = buildProspect(landing, currentSeason);
    if (prospect) prospects.push(prospect);
  }

  return prospects.sort((a, b) => (a.age ?? 99) - (b.age ?? 99) || a.name.localeCompare(b.name));
}

// ---- Persistence (reviewed daily by cron) ----

interface ProspectRow {
  id: number;
  name: string;
  position: string;
  is_goalie: number;
  age: number | null;
  current_club: string | null;
  current_league: string | null;
  nhl_games_played: number;
  headshot: string | null;
  career: string;
}

function rowToProspect(row: ProspectRow): LeafProspect {
  let career: CareerStatLine[] = [];
  try {
    career = JSON.parse(row.career) as CareerStatLine[];
  } catch {
    career = [];
  }
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    isGoalie: Boolean(row.is_goalie),
    age: row.age,
    currentClub: row.current_club,
    currentLeague: row.current_league,
    nhlGamesPlayed: row.nhl_games_played,
    headshot: row.headshot,
    career,
  };
}

export async function getStoredProspects(): Promise<LeafProspect[]> {
  try {
    const { env } = getCloudflareContext();
    const { results } = await env.DB.prepare(
      `SELECT id, name, position, is_goalie, age, current_club, current_league, nhl_games_played, headshot, career FROM prospects ORDER BY age ASC, name ASC`,
    ).all<ProspectRow>();
    if (results.length > 0) return results.map(rowToProspect);
  } catch {
    // table may not exist yet — fall through to a live compute
  }
  return computeProspects();
}

export async function reviewProspects(): Promise<{ total: number; added: number; dropped: number; kept: number; names: string[] }> {
  const { env } = getCloudflareContext();
  const current = await computeProspects();
  const currentIds = new Set(current.map((p) => p.id));

  const existing = await env.DB.prepare(`SELECT id FROM prospects`).all<{ id: number }>().catch(() => ({ results: [] as { id: number }[] }));
  const existingIds = new Set((existing.results ?? []).map((r) => r.id));

  const added = current.filter((p) => !existingIds.has(p.id)).length;
  const dropped = [...existingIds].filter((id) => !currentIds.has(id));

  const statements = [] as ReturnType<typeof env.DB.prepare>[];
  for (const p of current) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO prospects (id, name, position, is_goalie, age, current_club, current_league, nhl_games_played, headshot, career, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, position=excluded.position, is_goalie=excluded.is_goalie, age=excluded.age,
           current_club=excluded.current_club, current_league=excluded.current_league, nhl_games_played=excluded.nhl_games_played,
           headshot=excluded.headshot, career=excluded.career, updated_at=datetime('now')`,
      ).bind(p.id, p.name, p.position, p.isGoalie ? 1 : 0, p.age, p.currentClub, p.currentLeague, p.nhlGamesPlayed, p.headshot, JSON.stringify(p.career)),
    );
  }
  if (dropped.length > 0) {
    const placeholders = dropped.map(() => '?').join(', ');
    statements.push(env.DB.prepare(`DELETE FROM prospects WHERE id IN (${placeholders})`).bind(...dropped));
  }
  if (statements.length > 0) await env.DB.batch(statements);

  return { total: current.length, added, dropped: dropped.length, kept: current.length - added, names: current.map((p) => p.name) };
}
