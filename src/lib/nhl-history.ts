const NHL_API = 'https://api-web.nhle.com/v1';
const NHL_STATS_API = 'https://api.nhle.com/stats/rest/en';

export interface HistoricalPlayer {
  id: number;
  name: string;
  number?: number;
  position: string;
  shoots?: string;
}

export interface HistoricalRecord {
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export async function getLeafsSeasonIds() {
  const response = await fetch(`${NHL_API}/standings-season`, { next: { revalidate: 86400 } });
  if (!response.ok) return [];
  const data = await response.json() as { seasons?: Array<{ id: number }> };
  return (data.seasons ?? []).map((season) => season.id).filter((id) => id >= 19171918 && id <= 20252026).reverse();
}

export async function getLeafsSeason(seasonId: number) {
  const [rosterResponse, recordResponse] = await Promise.all([
    fetch(`${NHL_API}/roster/TOR/${seasonId}`, { next: { revalidate: 86400 } }),
    fetch(`${NHL_STATS_API}/team/summary?cayenneExp=teamId=10%20and%20seasonId=${seasonId}`, { next: { revalidate: 86400 } }),
  ]);
  if (!rosterResponse.ok || !recordResponse.ok) return null;

  const roster = await rosterResponse.json() as Record<'forwards' | 'defensemen' | 'goalies', NhlRosterPlayer[]>;
  const recordData = await recordResponse.json() as { data?: NhlRecord[] };
  const rawRecord = recordData.data?.[0];
  if (!rawRecord) return null;

  const mapPlayers = (players: NhlRosterPlayer[]) => players.map((player): HistoricalPlayer => ({
    id: player.id,
    name: `${player.firstName?.default ?? ''} ${player.lastName?.default ?? ''}`.trim(),
    number: player.sweaterNumber,
    position: player.positionCode ?? '—',
    shoots: player.shootsCatches,
  }));

  return {
    record: {
      gamesPlayed: rawRecord.gamesPlayed ?? 0,
      wins: rawRecord.wins ?? 0,
      losses: rawRecord.losses ?? 0,
      ties: rawRecord.ties ?? 0,
      otLosses: rawRecord.otLosses ?? 0,
      points: rawRecord.points ?? 0,
      goalsFor: rawRecord.goalsFor ?? 0,
      goalsAgainst: rawRecord.goalsAgainst ?? 0,
    } satisfies HistoricalRecord,
    forwards: mapPlayers(roster.forwards ?? []),
    defensemen: mapPlayers(roster.defensemen ?? []),
    goalies: mapPlayers(roster.goalies ?? []),
  };
}

export function seasonIdToLabel(seasonId: number) {
  const value = String(seasonId);
  return `${value.slice(0, 4)}–${value.slice(6)}`;
}

export function seasonIdToSlug(seasonId: number) {
  return seasonIdToLabel(seasonId).replace('–', '-');
}

export function seasonSlugToId(slug: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(slug);
  if (!match) return null;
  const start = Number(match[1]);
  const expectedEnd = String(start + 1).slice(-2);
  return match[2] === expectedEnd ? Number(`${start}${start + 1}`) : null;
}

interface NhlRosterPlayer {
  id: number;
  firstName?: { default?: string };
  lastName?: { default?: string };
  sweaterNumber?: number;
  positionCode?: string;
  shootsCatches?: string;
}

interface NhlRecord {
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number | null;
  otLosses?: number | null;
  points?: number;
  goalsFor?: number;
  goalsAgainst?: number;
}
