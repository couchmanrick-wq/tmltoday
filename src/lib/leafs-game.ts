import { parseHTML } from 'linkedom';

const NHL_API = 'https://api-web.nhle.com/v1';
const NHL_SITE = 'https://www.nhl.com';
const LINEUP_URL = 'https://www.dailyfaceoff.com/teams/toronto-maple-leafs/line-combinations';

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

function toGameSummary(game: NhlGame): GameSummary {
  const torontoTeam = game.awayTeam.abbrev === 'TOR' ? game.awayTeam : game.homeTeam;
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
      score: game.awayTeam.score,
    },
    home: {
      abbrev: game.homeTeam.abbrev ?? 'HOME',
      name: teamName(game.homeTeam),
      score: game.homeTeam.score,
    },
    resultType: game.gameOutcome?.lastPeriodType,
    tv: [...new Set(canadianNetworks.length > 0 ? canadianNetworks : allNetworks)],
    radioUrl: torontoTeam.radioLink,
    boxScoreUrl: game.gameCenterLink ? `${NHL_SITE}${game.gameCenterLink}` : `${NHL_SITE}/gamecenter/${game.id}`,
    condensedGameUrl: game.condensedGame ? `${NHL_SITE}${game.condensedGame}` : undefined,
  };
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
    if (!response.ok) return undefined;

    const { document } = parseHTML(await response.text());
    const forwards = namesFromRows(document.getElementById('forwards'));
    const defense = namesFromRows(document.getElementById('defense'));
    const goalies = namesFromRows(document.getElementById('goalies')).flat();
    if (forwards.length === 0 && defense.length === 0 && goalies.length === 0) return undefined;

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
    return undefined;
  }
}

export async function getLeafsGamePanel(): Promise<LeafsGamePanelData> {
  const [scheduleResult, projectedLineup] = await Promise.all([
    fetch(`${NHL_API}/club-schedule-season/TOR/now`, { next: { revalidate: 300 } })
      .then(async (response) => response.ok ? (await response.json()) as { games?: NhlGame[] } : { games: [] })
      .catch(() => ({ games: [] as NhlGame[] })),
    getProjectedLineup(),
  ]);

  const now = Date.now();
  const games = scheduleResult.games ?? [];
  const completed = games
    .filter((game) => ['OFF', 'FINAL'].includes(game.gameState ?? '') && Date.parse(game.startTimeUTC) <= now)
    .sort((a, b) => Date.parse(b.startTimeUTC) - Date.parse(a.startTimeUTC));
  const upcoming = games
    .filter((game) => !['OFF', 'FINAL'].includes(game.gameState ?? '') && Date.parse(game.startTimeUTC) >= now)
    .sort((a, b) => Date.parse(a.startTimeUTC) - Date.parse(b.startTimeUTC));

  return {
    lastGame: completed[0] ? toGameSummary(completed[0]) : undefined,
    nextGame: upcoming[0] ? toGameSummary(upcoming[0]) : undefined,
    projectedLineup,
  };
}
