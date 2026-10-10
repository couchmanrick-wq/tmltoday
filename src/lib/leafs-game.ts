import { parseHTML } from 'linkedom';

const NHL_API = 'https://api-web.nhle.com/v1';
const NHL_SITE = 'https://www.nhl.com';
const LEAFS_RADIO_URL = 'https://www.sportsnet.ca/590/';
const LINEUP_URL = 'https://www.dailyfaceoff.com/teams/toronto-maple-leafs/line-combinations';

// Kept as a last-known-good snapshot so a publisher-side bot challenge never removes the lineup
// from the homepage. A successful refresh from Daily Faceoff replaces this automatically.
const LAST_KNOWN_LINEUP: ProjectedLineup = {
  forwards: [
    ['Kirill Marchenko', 'Auston Matthews', 'Jack Roslovic'],
    ['Easton Cowan', 'Nick Paul', 'William Nylander'],
    ['Gavin McKenna', 'Colton Sissons', 'Bo Groulx'],
    ['Zack MacEwen', 'Teddy Blueger', 'Brandon Duhaime'],
  ],
  defense: [
    ['Jake McCabe', 'Darren Raddysh'],
    ['Morgan Rielly', 'Chris Tanev'],
    ['Oliver Ekman-Larsson', 'Troy Stecher'],
  ],
  goalies: ['Anthony Stolarz', 'Sergei Bobrovsky'],
  updatedAt: '2026-10-09T19:47:25.524Z',
  sourceName: 'Mark Masters',
  sourceUrl: LINEUP_URL,
};

interface NhlTeam {
  abbrev?: string;
  commonName?: { default?: string };
  placeName?: { default?: string };
  score?: number;
  radioLink?: string;
}

interface NhlGame {
  id: number;
  startTimeUTC: string;
  gameState?: string;
  venue?: { default?: string };
  awayTeam: NhlTeam;
  homeTeam: NhlTeam;
  tvBroadcasts?: Array<{ countryCode?: string; network?: string }>;
  gameOutcome?: { lastPeriodType?: string };
  condensedGame?: string;
  gameCenterLink?: string;
}

interface NhlGameClock {
  timeRemaining?: string;
  secondsRemaining?: number;
  running?: boolean;
  inIntermission?: boolean;
}

interface NhlPeriodDescriptor {
  number?: number;
  periodType?: string;
}

interface NhlSkaterGameStat {
  playerId: number;
  name?: { default?: string };
  goals?: number;
  assists?: number;
  points?: number;
}

interface NhlGoalieGameStat {
  playerId: number;
  name?: { default?: string };
  savePctg?: number;
  shotsAgainst?: number;
  saves?: number;
  toi?: string;
}

interface NhlTeamGameStats {
  forwards?: NhlSkaterGameStat[];
  defense?: NhlSkaterGameStat[];
  goalies?: NhlGoalieGameStat[];
}

interface NhlBoxscore {
  gameState?: string;
  clock?: NhlGameClock;
  periodDescriptor?: NhlPeriodDescriptor;
  awayTeam?: NhlTeam;
  homeTeam?: NhlTeam;
  playerByGameStats?: { awayTeam?: NhlTeamGameStats; homeTeam?: NhlTeamGameStats };
}

interface NhlRosterPlayer {
  id: number;
  firstName?: { default?: string };
  lastName?: { default?: string };
}

export interface LeafsSkaterGameStat {
  id: number;
  name: string;
  goals: number;
  assists: number;
  points: number;
}

export interface LeafsGoalieGameStat {
  id: number;
  name: string;
  savePercentage?: number;
}

export interface GameSummary {
  id: number;
  startsAt: string;
  venue: string;
  away: { abbrev: string; name: string; score?: number };
  home: { abbrev: string; name: string; score?: number };
  resultType?: string;
  tv: string[];
  radioUrl?: string;
  boxScoreUrl: string;
  condensedGameUrl?: string;
  leafsSkaters?: LeafsSkaterGameStat[];
  leafsGoalies?: LeafsGoalieGameStat[];
  isLive?: boolean;
  timeRemaining?: string;
  inIntermission?: boolean;
  periodNumber?: number;
  periodType?: string;
}

export interface ProjectedLineup {
  forwards: string[][];
  defense: string[][];
  goalies: string[];
  updatedAt?: string;
  sourceName?: string;
  sourceUrl: string;
}

export interface LeafsGamePanelData {
  lastGame?: GameSummary;
  nextGame?: GameSummary;
  projectedLineup?: ProjectedLineup;
}

const teamName = (team: NhlTeam) =>
  [team.placeName?.default, team.commonName?.default].filter(Boolean).join(' ') || team.abbrev || 'Team';

function toGameSummary(
  game: NhlGame,
  leafsStats?: { skaters: LeafsSkaterGameStat[]; goalies: LeafsGoalieGameStat[] },
  liveBoxscore?: NhlBoxscore,
): GameSummary {
  const torontoTeam = game.awayTeam.abbrev === 'TOR' ? game.awayTeam : game.homeTeam;
  const gameState = liveBoxscore?.gameState ?? game.gameState;
  const canadianNetworks = (game.tvBroadcasts ?? [])
    .filter((broadcast) => broadcast.countryCode === 'CA')
    .map((broadcast) => broadcast.network)
    .filter((network): network is string => Boolean(network));
  const allNetworks = (game.tvBroadcasts ?? [])
    .map((broadcast) => broadcast.network)
    .filter((network): network is string => Boolean(network));

  return {
    id: game.id,
    startsAt: game.startTimeUTC,
    venue: game.venue?.default ?? 'Venue TBA',
    away: {
      abbrev: game.awayTeam.abbrev ?? 'AWAY',
      name: teamName(game.awayTeam),
      score: liveBoxscore?.awayTeam?.score ?? game.awayTeam.score,
    },
    home: {
      abbrev: game.homeTeam.abbrev ?? 'HOME',
      name: teamName(game.homeTeam),
      score: liveBoxscore?.homeTeam?.score ?? game.homeTeam.score,
    },
    resultType: game.gameOutcome?.lastPeriodType,
    tv: [...new Set(canadianNetworks.length > 0 ? canadianNetworks : allNetworks)],
    radioUrl: torontoTeam.radioLink ? LEAFS_RADIO_URL : undefined,
    boxScoreUrl: game.gameCenterLink ? `${NHL_SITE}${game.gameCenterLink}` : `${NHL_SITE}/gamecenter/${game.id}`,
    condensedGameUrl: game.condensedGame ? `${NHL_SITE}${game.condensedGame}` : undefined,
    leafsSkaters: leafsStats?.skaters,
    leafsGoalies: leafsStats?.goalies,
    isLive: gameState === 'LIVE' || gameState === 'CRIT',
    timeRemaining: liveBoxscore?.clock?.timeRemaining,
    inIntermission: liveBoxscore?.clock?.inIntermission,
    periodNumber: liveBoxscore?.periodDescriptor?.number,
    periodType: liveBoxscore?.periodDescriptor?.periodType,
  };
}

async function getNhlBoxscore(gameId: number, fresh = false): Promise<NhlBoxscore | undefined> {
  try {
    const response = await fetch(
      `${NHL_API}/gamecenter/${gameId}/boxscore`,
      fresh ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    );
    return response.ok ? await response.json() as NhlBoxscore : undefined;
  } catch {
    return undefined;
  }
}

async function getLeafsBoxscoreStats(game: NhlGame, suppliedBoxscore?: NhlBoxscore) {
  try {
    const [boxscore, rosterResponse] = await Promise.all([
      suppliedBoxscore ? Promise.resolve(suppliedBoxscore) : getNhlBoxscore(game.id),
      fetch(`${NHL_API}/roster/TOR/current`, { next: { revalidate: 3600 } }),
    ]);
    if (!boxscore) return undefined;
    const roster = rosterResponse.ok
      ? await rosterResponse.json() as Record<'forwards' | 'defensemen' | 'goalies', NhlRosterPlayer[]>
      : { forwards: [], defensemen: [], goalies: [] };
    const fullNames = new Map(
      [...(roster.forwards ?? []), ...(roster.defensemen ?? []), ...(roster.goalies ?? [])]
        .map((player) => [
          player.id,
          `${player.firstName?.default ?? ''} ${player.lastName?.default ?? ''}`.trim(),
        ] as const)
    );
    const teamStats = game.awayTeam.abbrev === 'TOR'
      ? boxscore.playerByGameStats?.awayTeam
      : boxscore.playerByGameStats?.homeTeam;
    if (!teamStats) return undefined;

    const skaters = [...(teamStats.forwards ?? []), ...(teamStats.defense ?? [])]
      .map((player) => ({
        id: player.playerId,
        name: fullNames.get(player.playerId) || player.name?.default || 'Leafs skater',
        goals: player.goals ?? 0,
        assists: player.assists ?? 0,
        points: player.points ?? 0,
      }))
      .filter((player) => player.goals > 0 || player.assists > 0 || player.points > 0)
      .sort((a, b) => b.points - a.points || b.goals - a.goals || b.assists - a.assists);
    const goalies = (teamStats.goalies ?? [])
      .filter((goalie) => goalie.toi && goalie.toi !== '00:00')
      .map((goalie) => ({
        id: goalie.playerId,
        name: fullNames.get(goalie.playerId) || goalie.name?.default || 'Leafs goalie',
        savePercentage: goalie.savePctg ?? (goalie.shotsAgainst ? (goalie.saves ?? 0) / goalie.shotsAgainst : undefined),
      }));

    return { skaters, goalies };
  } catch {
    return undefined;
  }
}

function namesFromRows(heading: Element | null): string[][] {
  const container = heading?.parentElement?.parentElement;
  if (!container) return [];

  return [...container.children]
    .slice(1)
    .map((row) => [...row.querySelectorAll('img[alt]')]
      .map((image) => image.getAttribute('alt')?.trim())
      .filter((name): name is string => Boolean(name)))
    .filter((row) => row.length > 0);
}

async function getProjectedLineup(): Promise<ProjectedLineup | undefined> {
  try {
    const response = await fetch(LINEUP_URL, { next: { revalidate: 1800 } });
    if (!response.ok) return LAST_KNOWN_LINEUP;

    const { document } = parseHTML(await response.text());
    const forwards = namesFromRows(document.getElementById('forwards'));
    const defense = namesFromRows(document.getElementById('defense'));
    const goalies = namesFromRows(document.getElementById('goalies')).flat();
    if (forwards.length === 0 && defense.length === 0 && goalies.length === 0) return LAST_KNOWN_LINEUP;

    const updatedLabel = [...document.querySelectorAll('span')]
      .find((element) => element.textContent?.trim() === 'Last updated:')
      ?.nextElementSibling?.textContent?.trim();
    const sourceLabel = [...document.querySelectorAll('span')]
      .find((element) => element.textContent?.trim() === 'Source:')
      ?.nextElementSibling?.textContent?.trim();

    return {
      forwards,
      defense,
      goalies,
      updatedAt: updatedLabel,
      sourceName: sourceLabel,
      sourceUrl: LINEUP_URL,
    };
  } catch {
    return LAST_KNOWN_LINEUP;
  }
}

export async function getLeafsGamePanel({ fresh = false }: { fresh?: boolean } = {}): Promise<LeafsGamePanelData> {
  const [scheduleResult, projectedLineup] = await Promise.all([
    fetch(
      `${NHL_API}/club-schedule-season/TOR/now`,
      fresh ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    )
      .then(async (response) => response.ok ? (await response.json()) as { games?: NhlGame[] } : { games: [] })
      .catch(() => ({ games: [] as NhlGame[] })),
    getProjectedLineup(),
  ]);

  const now = Date.now();
  const games = scheduleResult.games ?? [];
  const completed = games
    .filter((game) => ['OFF', 'FINAL'].includes(game.gameState ?? '') && Date.parse(game.startTimeUTC) <= now)
    .sort((a, b) => Date.parse(b.startTimeUTC) - Date.parse(a.startTimeUTC));
  const liveGames = games
    .filter((game) => ['LIVE', 'CRIT'].includes(game.gameState ?? ''))
    .sort((a, b) => Date.parse(b.startTimeUTC) - Date.parse(a.startTimeUTC));
  const liveGame = liveGames[0];
  const upcomingCutoff = liveGame ? Date.parse(liveGame.startTimeUTC) : now - (6 * 60 * 60 * 1000);
  const upcoming = games
    .filter((game) => ['FUT', 'PRE'].includes(game.gameState ?? '') && Date.parse(game.startTimeUTC) >= upcomingCutoff)
    .sort((a, b) => Date.parse(a.startTimeUTC) - Date.parse(b.startTimeUTC));
  const lastGame = liveGame ?? completed[0];
  const liveBoxscore = liveGame ? await getNhlBoxscore(liveGame.id, true) : undefined;
  const lastGameStats = lastGame ? await getLeafsBoxscoreStats(lastGame, liveBoxscore) : undefined;

  return {
    lastGame: lastGame ? toGameSummary(lastGame, lastGameStats, liveBoxscore) : undefined,
    nextGame: upcoming[0] ? toGameSummary(upcoming[0]) : undefined,
    projectedLineup,
  };
}
