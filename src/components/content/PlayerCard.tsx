'use client';

import Image from 'next/image';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Player Image */}
      <div className="relative w-full h-48 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center">
        {player.image ? (
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-6xl font-bold text-white opacity-30">
            {player.number}
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{player.name}</h3>
          <span className="text-2xl font-bold text-blue-600">#{player.number}</span>
        </div>

        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-semibold">Position:</span> {player.position}
          </p>
          {player.shoots && (
            <p>
              <span className="font-semibold">Shoots:</span> {player.shoots}
            </p>
          )}
          {player.height && (
            <p>
              <span className="font-semibold">Height:</span> {player.height}
            </p>
          )}
          {player.weight && (
            <p>
              <span className="font-semibold">Weight:</span> {player.weight}
            </p>
          )}
        </div>

        {/* Mentions Badge */}
        {player.mentions && player.mentions > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                BUZZ
              </span>
              <span className="text-lg font-bold text-blue-600">
                {player.mentions}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: `${Math.min((player.mentions / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerGridProps {
  players: Player[];
  cols?: 2 | 3 | 4;
}

export function PlayerGrid({ players, cols = 3 }: PlayerGridProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridClass[cols]}`}>
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
