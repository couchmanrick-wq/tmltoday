const NHL_STANDINGS_URL = 'https://api-web.nhle.com/v1/standings/2026-04-16';

export interface DivisionStanding {
  rank: number;
  team: string;
  abbreviation: string;
  gp: number;
  wins: number;
  losses: number;
  otl: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const FINAL_2025_26_ATLANTIC: DivisionStanding[] = [
  { rank: 1, team: 'Buffalo Sabres', abbreviation: 'BUF', gp: 82, wins: 50, losses: 23, otl: 9, goalsFor: 288, goalsAgainst: 241, points: 109 },
  { rank: 2, team: 'Tampa Bay Lightning', abbreviation: 'TBL', gp: 82, wins: 50, losses: 26, otl: 6, goalsFor: 290, goalsAgainst: 231, points: 106 },
  { rank: 3, team: 'Montréal Canadiens', abbreviation: 'MTL', gp: 82, wins: 48, losses: 24, otl: 10, goalsFor: 283, goalsAgainst: 256, points: 106 },
  { rank: 4, team: 'Boston Bruins', abbreviation: 'BOS', gp: 82, wins: 45, losses: 27, otl: 10, goalsFor: 272, goalsAgainst: 250, points: 100 },
  { rank: 5, team: 'Ottawa Senators', abbreviation: 'OTT', gp: 82, wins: 44, losses: 27, otl: 11, goalsFor: 278, goalsAgainst: 246, points: 99 },
  { rank: 6, team: 'Detroit Red Wings', abbreviation: 'DET', gp: 82, wins: 41, losses: 31, otl: 10, goalsFor: 241, goalsAgainst: 258, points: 92 },
  { rank: 7, team: 'Florida Panthers', abbreviation: 'FLA', gp: 82, wins: 40, losses: 38, otl: 4, goalsFor: 251, goalsAgainst: 276, points: 84 },
  { rank: 8, team: 'Toronto Maple Leafs', abbreviation: 'TOR', gp: 82, wins: 32, losses: 36, otl: 14, goalsFor: 253, goalsAgainst: 299, points: 78 },
];

interface NhlStanding {
  divisionAbbrev?: string;
  divisionSequence?: number;
  teamName?: { default?: string };
  teamAbbrev?: { default?: string };
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  otLosses?: number;
  goalFor?: number;
  goalAgainst?: number;
  points?: number;
}

export async function getAtlanticStandings(): Promise<DivisionStanding[]> {
  try {
    const response = await fetch(NHL_STANDINGS_URL, { next: { revalidate: 21600 } });
    if (!response.ok) throw new Error(`NHL standings returned ${response.status}`);

    const data = (await response.json()) as { standings?: NhlStanding[] };
    const standings = (data.standings ?? [])
      .filter((row) => row.divisionAbbrev === 'A')
      .sort((a, b) => (a.divisionSequence ?? 99) - (b.divisionSequence ?? 99))
      .map((row, index) => ({
        rank: row.divisionSequence ?? index + 1,
        team: row.teamName?.default ?? 'Unknown team',
        abbreviation: row.teamAbbrev?.default ?? '',
        gp: row.gamesPlayed ?? 0,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
        otl: row.otLosses ?? 0,
        goalsFor: row.goalFor ?? 0,
        goalsAgainst: row.goalAgainst ?? 0,
        points: row.points ?? 0,
      }));

    return standings.length === 8 ? standings : FINAL_2025_26_ATLANTIC;
  } catch {
    return FINAL_2025_26_ATLANTIC;
  }
}

export const NHL_STANDINGS_SOURCE_URL = NHL_STANDINGS_URL;
