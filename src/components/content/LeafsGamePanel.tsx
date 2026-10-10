import { LeafsGamePanelData } from '@/lib/leafs-game';

const torontoDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const torontoTime = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold text-blue-600 hover:text-blue-800"
    >
      {children}
    </a>
  );
}

function TeamScore({ abbrev, name, score }: { abbrev: string; name: string; score?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="min-w-0">
        <span className="mr-2 inline-block w-8 text-xs font-black text-blue-600">{abbrev}</span>
        <span className="text-sm font-bold text-brand">{name}</span>
      </span>
      <span className="text-2xl font-bold tabular-nums text-brand">{score ?? '-'}</span>
    </div>
  );
}

function LineRows({ title, rows }: { title: string; rows: string[][] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{title}</p>
      <ol className="space-y-1.5">
        {rows.map((row, index) => (
          <li key={`${title}-${index}`} className="grid grid-cols-[16px_minmax(0,1fr)] gap-1 text-xs leading-4 text-slate-700">
            <span className="font-bold text-blue-600">{index + 1}</span>
            <span>{row.join(' / ')}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LastGameLeafsStats({ game }: { game: NonNullable<LeafsGamePanelData['lastGame']> }) {
  const skaters = game.leafsSkaters ?? [];
  const goalies = game.leafsGoalies ?? [];
  const hasStats = skaters.length > 0 || goalies.length > 0;

  if (!hasStats) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 text-xs font-bold text-blue-600">
        <ExternalLink href={game.boxScoreUrl}>Box Score</ExternalLink>
        {game.condensedGameUrl && <><span aria-hidden="true">•</span><ExternalLink href={game.condensedGameUrl}>Condensed Game Video</ExternalLink></>}
      </div>
    );
  }

  return (
    <details className="group mt-4 pt-4">
      <summary className="cursor-pointer list-none text-xs font-bold text-blue-600 marker:hidden hover:text-blue-800">
        <span className="flex flex-wrap items-center gap-2">
          <span>Leafs Scoring</span>
          <span aria-hidden="true">•</span>
          <ExternalLink href={game.boxScoreUrl}>Box Score</ExternalLink>
          {game.condensedGameUrl && <><span aria-hidden="true">•</span><ExternalLink href={game.condensedGameUrl}>Condensed Game Video</ExternalLink></>}
        </span>
      </summary>
      <div className="mt-3">
        {skaters.length > 0 && (
          <div>
          <div className="grid grid-cols-[minmax(0,1fr)_24px_24px_24px] gap-1 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase text-slate-500">
            <span>Player</span>
            <span className="text-right">G</span>
            <span className="text-right">A</span>
            <span className="text-right">P</span>
          </div>
          <div className="divide-y divide-slate-200">
            {skaters.map((skater) => (
              <div key={skater.id} className="grid grid-cols-[minmax(0,1fr)_24px_24px_24px] gap-1 py-2 text-xs">
                <span className="truncate font-bold text-brand">{skater.name}</span>
                <span className="text-right tabular-nums text-slate-600">{skater.goals}</span>
                <span className="text-right tabular-nums text-slate-600">{skater.assists}</span>
                <span className="text-right font-bold tabular-nums text-brand">{skater.points}</span>
              </div>
            ))}
          </div>
          </div>
        )}

        {goalies.length > 0 && (
          <div className={skaters.length > 0 ? 'mt-3' : ''}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Leafs goaltending</p>
            {goalies.map((goalie) => (
              <div key={goalie.id} className="flex items-center justify-between gap-3 py-1 text-xs">
                <span className="font-bold text-brand">{goalie.name}</span>
                <span className="font-bold tabular-nums text-brand">
                  {goalie.savePercentage == null ? 'SV% —' : `SV% ${goalie.savePercentage.toFixed(3).replace(/^0/, '')}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export function LeafsGamePanel({ data }: { data: LeafsGamePanelData }) {
  const { lastGame, nextGame, projectedLineup } = data;
  if (!lastGame && !nextGame) return null;

  return (
    <section aria-labelledby="leafs-game-panel" className="border-t-4 border-brand pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="leafs-game-panel" className="text-2xl font-bold leading-tight text-brand">Leafs game centre</h2>
        <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">Next / Last</span>
      </div>

      <div className="divide-y divide-slate-300">
        {lastGame && (
        <div className="py-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-base font-bold uppercase tracking-wide text-red-600">Latest game</p>
            <p className="text-xs font-semibold text-slate-500">{torontoDate.format(new Date(lastGame.startsAt))}</p>
          </div>
          <TeamScore {...lastGame.away} />
          <TeamScore {...lastGame.home} />
          {lastGame.resultType && lastGame.resultType !== 'REG' && (
            <p className="mt-1 text-right text-[10px] font-bold uppercase text-slate-500">Final / {lastGame.resultType}</p>
          )}
          <LastGameLeafsStats game={lastGame} />
        </div>
        )}

        {nextGame && (
        <div className="py-4">
          <p className="text-base font-bold uppercase tracking-wide text-red-600">Next game</p>
          <p className="mt-2 text-xl font-bold leading-tight text-brand">
            {nextGame.away.abbrev} <span className="text-slate-400">at</span> {nextGame.home.abbrev}
          </p>
          <p className="mt-1 text-sm font-bold text-brand">
            {torontoDate.format(new Date(nextGame.startsAt))} at {torontoTime.format(new Date(nextGame.startsAt))}
          </p>
          <dl className="mt-3 grid grid-cols-[52px_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs leading-5">
            <dt className="font-bold uppercase text-slate-500">Arena</dt>
            <dd className="font-semibold text-slate-700">{nextGame.venue}</dd>
            <dt className="font-bold uppercase text-slate-500">TV</dt>
            <dd className="font-semibold text-slate-700">{nextGame.tv.join(', ') || 'TBA'}</dd>
            <dt className="font-bold uppercase text-slate-500">Radio</dt>
            <dd>{nextGame.radioUrl ? <ExternalLink href={nextGame.radioUrl}>Listen Live</ExternalLink> : <span className="font-semibold text-slate-700">TBA</span>}</dd>
          </dl>
          {projectedLineup && (
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-xs font-bold text-blue-600 marker:hidden hover:text-blue-800">
                <span className="flex flex-wrap items-center gap-2">
                  <ExternalLink href={nextGame.boxScoreUrl}>Game centre</ExternalLink>
                  <span aria-hidden="true">•</span>
                  <span>Expected Lines</span>
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                <LineRows title="Forwards" rows={projectedLineup.forwards} />
                <LineRows title="Defence" rows={projectedLineup.defense} />
                {projectedLineup.goalies.length > 0 && <LineRows title="Goalies" rows={[projectedLineup.goalies]} />}
                <p className="text-[10px] leading-4 text-slate-500">
                  Projected, not confirmed.{' '}
                  <ExternalLink href={projectedLineup.sourceUrl}>Daily Faceoff</ExternalLink>
                  {projectedLineup.sourceName ? ` via ${projectedLineup.sourceName}` : ''}
                  {projectedLineup.updatedAt && <> &middot; Updated {torontoDate.format(new Date(projectedLineup.updatedAt))}</>}
                </p>
              </div>
            </details>
          )}
          {!projectedLineup && (
            <div className="mt-3 text-xs"><ExternalLink href={nextGame.boxScoreUrl}>Game centre</ExternalLink></div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
