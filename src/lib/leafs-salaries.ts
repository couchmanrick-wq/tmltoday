// Player compensation, published by the NHLPA. Their site loads it client-side from this route,
// which returns every team for a given season year; we keep the Leafs and key it by the NHL player
// id so it joins straight onto the roster and prospect data.
const NHLPA_COMPENSATION = 'https://www.nhlpa.com/api/compensation';
const TEAM_TRICODE = 'TOR';

export const SALARY_SOURCE = { label: 'NHLPA', href: 'https://www.nhlpa.com/compensation/toronto-maple-leafs/' };

export interface PlayerSalary {
  seasonYear: number;
  baseSalary: number;
  aav: number;
  totalSalary: number;
  signingBonus: number;
}

interface CompensationEntry {
  player?: { nhlId?: number };
  compensation?: {
    seasonYear?: number;
    aav?: number;
    totalSalary?: number;
    baseSalary?: number;
    signingBonus?: number;
  };
}

interface TeamCompensation {
  team?: { tricode?: string };
  players?: CompensationEntry[];
}

/** "2026-27" for the season that pays out in 2026. */
export function salarySeasonLabel(seasonYear: number) {
  return `${seasonYear}-${String((seasonYear + 1) % 100).padStart(2, '0')}`;
}

export function formatSalary(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * The profile's salary line. Total cash leads because base salary on its own is misleading on the
 * bonus-heavy deals this roster is full of, where the base sits near the league minimum.
 */
export function toSalaryLine(salary: PlayerSalary) {
  return {
    seasonLabel: salarySeasonLabel(salary.seasonYear),
    total: formatSalary(salary.totalSalary || salary.baseSalary + salary.signingBonus),
    base: formatSalary(salary.baseSalary),
    signingBonus: salary.signingBonus > 0 ? formatSalary(salary.signingBonus) : null,
    capHit: formatSalary(salary.aav),
  };
}

export async function getLeafsSalaries(): Promise<Map<number, PlayerSalary>> {
  const byNhlId = new Map<number, PlayerSalary>();

  try {
    const year = new Date().getFullYear();
    const response = await fetch(`${NHLPA_COMPENSATION}/${year}`, {
      headers: { 'user-agent': 'TMLtodayBot/1.0 (+https://tmltoday.com)' },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return byNhlId;

    const teams = (await response.json()) as TeamCompensation[];
    const leafs = teams.find((team) => team.team?.tricode === TEAM_TRICODE);

    for (const entry of leafs?.players ?? []) {
      const nhlId = entry.player?.nhlId;
      const pay = entry.compensation;
      if (!nhlId || !pay?.seasonYear) continue;

      byNhlId.set(nhlId, {
        seasonYear: pay.seasonYear,
        baseSalary: pay.baseSalary ?? 0,
        aav: pay.aav ?? 0,
        totalSalary: pay.totalSalary ?? 0,
        signingBonus: pay.signingBonus ?? 0,
      });
    }

    return byNhlId;
  } catch {
    return byNhlId;
  }
}
