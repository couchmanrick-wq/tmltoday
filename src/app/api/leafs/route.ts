import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SEASONS = ["20262027", "20252026"];
const NHL_SITE = "https://www.nhl.com";
const LEAFS_RADIO_URL = "https://www.sportsnet.ca/590/";

const etDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  month: "2-digit",
  day: "2-digit"
});

const CORS = {
  "Access-Control-Allow-Origin": "https://forums.tmltoday.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

async function fetchSchedule(season: string): Promise<any[]> {
  const response = await fetch(
    `https://api-web.nhle.com/v1/club-schedule-season/TOR/${season}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Schedule request failed: ${response.status}`);
  }

  return ((await response.json()) as any).games ?? [];
}

export async function GET(request: Request) {
  try {
    // ?d=MM-DD picks the Leafs game on that day (game day threads); otherwise the latest started game
    const day = new URL(request.url).searchParams.get("d");
    let latest: any;

    if (day && /^\d{2}-\d{2}$/.test(day)) {
      for (const season of SEASONS) {
        const games = await fetchSchedule(season);
        latest = games.find(
          (g: any) => etDay.format(new Date(g.startTimeUTC)).replace("/", "-") === day
        );
        if (latest) break;
      }
    } else {
      // Find the latest started Leafs regular-season game
      const games = (await fetchSchedule(SEASONS[0]))
        .filter((g: any) =>
          g.gameType === 2 &&
          new Date(g.startTimeUTC).getTime() <= Date.now() &&
          ["LIVE", "CRIT", "FINAL", "OFF"].includes(g.gameState)
        )
        .sort((a: any, b: any) =>
          Date.parse(b.startTimeUTC) -
          Date.parse(a.startTimeUTC)
        );

      latest = games[0];
    }

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
        startsAt: latest.startTimeUTC,
        venue: latest.venue?.default ?? "",
        tv: (latest.tvBroadcasts ?? [])
          .filter((b: any) => b.countryCode === "CA")
          .map((b: any) => b.network)
          .filter(Boolean),
        boxScoreUrl: latest.gameCenterLink
          ? `${NHL_SITE}${latest.gameCenterLink}`
          : `${NHL_SITE}/gamecenter/${game.id}`,
        condensedGameUrl: latest.condensedGame ? `${NHL_SITE}${latest.condensedGame}` : null,
        radioUrl:
          (latest.awayTeam?.abbrev === "TOR" ? latest.awayTeam : latest.homeTeam)?.radioLink
            ? LEAFS_RADIO_URL
            : null,
        resultType: latest.gameOutcome?.lastPeriodType ?? null,
        inIntermission: Boolean(game.clock?.inIntermission),
        periodNumber: period,
        periodType: type ?? null,
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
