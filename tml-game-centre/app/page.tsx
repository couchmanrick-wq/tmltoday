"use client";

import { useEffect, useState } from "react";

type Team = { code: string; name: string; score: number; shots: number | null };
type Game = {
  gameId: number;
  live: boolean;
  final: boolean;
  periodText: string;
  clock: string;
  away: Team;
  home: Team;
};

function statusText(game: Game) {
  if (game.final) return "Final";
  const period = game.periodText.replace("Period ", "");
  const ordinal = ["", "1st", "2nd", "3rd"][Number(period)] ?? period;
  return game.clock ? `${ordinal} · ${game.clock}` : ordinal;
}

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className="text-xl font-bold tracking-wide">{team.code}</span>
      <span className="text-[10px] text-slate-300">{team.name}</span>
    </div>
  );
}

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/leafs")
        .then((response) => response.json() as Promise<Game>)
        .then((data) => active && data.away && setGame(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!game) return null;

  const shots = game.away.shots != null && game.home.shots != null;

  return (
    <main className="p-2">
      <section className="mx-auto max-w-xl rounded-lg bg-[#00205b] px-4 py-2 text-white shadow">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide">
          <span>TML Today · Game Centre</span>
          {game.live ? (
            <span className="text-emerald-400">● Live</span>
          ) : (
            <span className="text-slate-300">{game.final ? "Final" : ""}</span>
          )}
        </div>

        <div className="grid grid-cols-3 items-center py-1">
          <TeamBlock team={game.away} />
          <div className="text-center leading-tight">
            <div className="text-2xl font-bold">
              {game.away.score} – {game.home.score}
            </div>
            {!game.final && (
              <div className="text-xs font-semibold text-emerald-400">{statusText(game)}</div>
            )}
          </div>
          <TeamBlock team={game.home} />
        </div>

        {shots && (
          <div className="flex items-center justify-between border-t border-white/10 pt-1 text-xs">
            <span className="text-slate-300">Shots on goal</span>
            <span className="font-bold">
              {game.away.shots} – {game.home.shots}
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
