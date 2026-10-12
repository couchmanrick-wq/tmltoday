import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SEASON = "20262027";

const CORS = {
  "Access-Control-Allow-Origin": "https://forums.tmltoday.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  try {
    // Find the latest started Leafs regular-season game
    const scheduleResponse = await fetch(
      `https://api-web.nhle.com/v1/club-schedule-season/TOR/${SEASON}`,
      { cache: "no-store" }
    );

    if (!scheduleResponse.ok) {
      throw new Error(`Schedule request failed: ${scheduleResponse.status}`);
    }

    const schedule: any = await scheduleResponse.json();

    const games = (schedule.games ?? [])
      .filter((g: any) =>
        g.gameType === 2 &&
        new Date(g.startTimeUTC).getTime() <= Date.now() &&
        ["LIVE", "CRIT", "FINAL", "OFF"].includes(g.gameState)
      )
      .sort((a: any, b: any) =>
        Date.parse(b.startTimeUTC) -
        Date.parse(a.startTimeUTC)
      );

    const latest = games[0];

    if (!latest) {
      return NextResponse.json({
        game: null,
        message: "No completed or live Leafs game found"
      });
    }

    // Retrieve live information for that game
    const detailsResponse = await fetch(
      `https://api-web.nhle.com/v1/gamecenter/${latest.id}/landing`,
      { cache: "no-store" }
    );

    if (!detailsResponse.ok) {
      throw new Error(`Game details request failed: ${detailsResponse.status}`);
    }

    const game: any = await detailsResponse.json();

    // Period scoring and team stats live in the right-rail feed (optional)
    const rail: any = await fetch(
      `https://api-web.nhle.com/v1/gamecenter/${latest.id}/right-rail`,
      { cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const periodName = (d: any) =>
      d?.periodType === "SO" ? "SO" : d?.periodType === "OT" ? "OT" : ["", "1st", "2nd", "3rd"][d?.number] ?? "";

    const periods = (rail?.linescore?.byPeriod ?? []).map((p: any) => ({
      label: periodName(p.periodDescriptor),
      away: p.away ?? 0,
      home: p.home ?? 0
    }));

    const goals = (game.summary?.scoring ?? []).flatMap((p: any) =>
      (p.goals ?? []).map((g: any) => ({
        team: g.teamAbbrev?.default ?? g.teamAbbrev,
        name: g.name?.default ?? "",
        period: periodName(p.periodDescriptor),
        time: g.timeInPeriod ?? "",
        strength: g.strength ?? "ev",
        assists: (g.assists ?? []).map((a: any) => a.name?.default ?? "").filter(Boolean),
        clip: g.highlightClipSharingUrl ?? null
      }))
    );

    const stat = (category: string) =>
      (rail?.teamGameStats ?? []).find((t: any) => t.category === category);
    const pair = (category: string, pct = false) => {
      const t = stat(category);
      if (!t) return null;
      const f = (v: any) => (pct ? Math.round(Number(v) * 100) : v);
      return { away: f(t.awayValue), home: f(t.homeValue) };
    };
    const stats = {
      powerPlay: pair("powerPlay"),
      hits: pair("hits"),
      faceoffPct: pair("faceoffWinningPctg", true),
      blocks: pair("blockedShots")
    };

    const state = game.gameState;
    const live = ["LIVE", "CRIT"].includes(state);
    const final = ["FINAL", "OFF"].includes(state);

    const period = game.periodDescriptor?.number ?? 0;
    const type = game.periodDescriptor?.periodType;

    const periodText = final
      ? "Final"
      : game.clock?.inIntermission
        ? "Intermission"
        : type === "OT"
          ? "Overtime"
          : type === "SO"
            ? "Shootout"
            : period
              ? `Period ${period}`
              : "Scheduled";

    return NextResponse.json(
      {
        gameId: game.id,
        live,
        final,
        periodText,
        clock: live
          ? (game.clock?.timeRemaining ?? "")
          : "",
        periods,
        goals,
        stats,
        away: {
          code: game.awayTeam.abbrev,
          name: game.awayTeam.commonName?.default ?? "",
          score: game.awayTeam.score ?? 0,
          shots: game.awayTeam.sog ?? null
        },
        home: {
          code: game.homeTeam.abbrev,
          name: game.homeTeam.commonName?.default ?? "",
          score: game.homeTeam.score ?? 0,
          shots: game.homeTeam.sog ?? null
        }
      },
      {
        headers: {
          ...CORS,
          "Cache-Control":
            "public, s-maxage=15, stale-while-revalidate=15"
        }
      }
    );
  } catch (error) {
    console.error("Leafs API:", error);

    return NextResponse.json(
      { error: "Game information unavailable" },
      { status: 502, headers: CORS }
    );
  }
}
