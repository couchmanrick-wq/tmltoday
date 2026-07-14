const NHL_API = 'https://api-web.nhle.com/v1';

export interface RosterStat {
  id: number;
  name: string;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
}

export interface RosterStats {
  season: number;
  players: RosterStat[];
}

interface NhlSkater {
  playerId: number;
  firstName?: { default?: string };
  lastName?: { default?: string };
  positionCode?: string;
  gamesPlayed?: number;
  goals?: number;
  assists?: number;
  points?: number;
}

interface NhlGoalie {
  playerId: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  savePercentage?: number;
  goalsAgainstAverage?: number;
  shutouts?: number;
}

export interface StatCell {
  label: string;
  value: string;
}

/** The stat line shown on a profile: skaters get GP/G/A/PTS, goalies GP/W/L/SV%. */
export interface PlayerSeasonStats {
  season: number;
  cells: StatCell[];
}

const formatSavePctg = (value?: number) =>
  value == null ? '—' : value.toFixed(3).replace(/^0/, '');

/**
 * Season stats for every player on the club, keyed by NHL player id. `club-stats/now` reports the
 * most recently completed season, which is what a profile wants to show out of season.
 */
export async function getClubSeasonStats(): Promise<{ season: number; byPlayerId: Map<number, PlayerSeasonStats> }> {
  const byPlayerId = new Map<number, PlayerSeasonStats>();

  try {
    const response = await fetch(`${NHL_API}/club-stats/TOR/now`, { next: { revalidate: 86400 } });
    if (!response.ok) return { season: 0, byPlayerId };

    const data = (await response.json()) as { season?: number; skaters?: NhlSkater[]; goalies?: NhlGoalie[] };
    const season = data.season ?? 0;

    for (const skater of data.skaters ?? []) {
      byPlayerId.set(skater.playerId, {
        season,
        cells: [
          { label: 'GP', value: String(skater.gamesPlayed ?? 0) },
          { label: 'G', value: String(skater.goals ?? 0) },
          { label: 'A', value: String(skater.assists ?? 0) },
          { label: 'PTS', value: String(skater.points ?? 0) },
        ],
      });
    }

    for (const goalie of data.goalies ?? []) {
      byPlayerId.set(goalie.playerId, {
        season,
        cells: [
          { label: 'GP', value: String(goalie.gamesPlayed ?? 0) },
          { label: 'W', value: String(goalie.wins ?? 0) },
          { label: 'L', value: String(goalie.losses ?? 0) },
          { label: 'SV%', value: formatSavePctg(goalie.savePercentage) },
        ],
      });
    }

    return { season, byPlayerId };
  } catch {
    return { season: 0, byPlayerId };
  }
}

export function statsSeasonLabel(season: number): string {
  const value = String(season);
  return value.length === 8 ? `${value.slice(0, 4)}-${value.slice(6)}` : value;
}

// Most recent player stats for the Leafs roster, refreshed daily (revalidated every 24h). Once the
// new season starts, club-stats/now returns that season, so the leaders update on their own.
export async function getRosterStats(limit = 10): Promise<RosterStats> {
  try {
    const response = await fetch(`${NHL_API}/club-stats/TOR/now`, { next: { revalidate: 86400 } });
    if (!response.ok) return { season: 0, players: [] };
    const data = (await response.json()) as { season?: number; skaters?: NhlSkater[] };
    const players = (data.skaters ?? [])
      .map((s) => ({
        id: s.playerId,
        name: `${s.firstName?.default ?? ''} ${s.lastName?.default ?? ''}`.trim(),
        position: s.positionCode ?? '—',
        gamesPlayed: s.gamesPlayed ?? 0,
        goals: s.goals ?? 0,
        assists: s.assists ?? 0,
        points: s.points ?? 0,
      }))
      .sort((a, b) => b.points - a.points || b.goals - a.goals)
      .slice(0, limit);
    return { season: data.season ?? 0, players };
  } catch {
    return { season: 0, players: [] };
  }
}
