import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SEASON = "20262027";

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
          "Access-Control-Allow-Origin": "*",
          "Cache-Control":
            "public, s-maxage=15, stale-while-revalidate=15"
        }
      }
    );
  } catch (error) {
    console.error("Leafs API:", error);

    return NextResponse.json(
      { error: "Game information unavailable" },
      { status: 502 }
    );
  }
}
