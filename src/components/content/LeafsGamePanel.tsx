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
      className="font-bold text-blue-600 underline decoration-blue-200 underline-offset-4 hover:text-pink-600"
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
      <span className="text-2xl font-black tabular-nums text-brand">{score ?? '-'}</span>
    </div>
  );
}

function LineRows({ title, rows }: { title: string; rows: string[][] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{title}</p>
      <ol className="space-y-1.5">
        {rows.map((row, index) => (
          <li key={`${title}-${index}`} className="grid grid-cols-[16px_minmax(0,1fr)] gap-1 text-xs leading-4 text-slate-700">
            <span className="font-black text-blue-600">{index + 1}</span>
            <span>{row.join(' / ')}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LeafsGamePanel({ data }: { data: LeafsGamePanelData }) {
  const { lastGame, nextGame, projectedLineup } = data;
  if (!lastGame && !nextGame) return null;

  return (
    <section aria-labelledby="leafs-game-panel" className="overflow-hidden border border-slate-300 bg-white shadow-[0_12px_35px_rgba(9,30,66,0.08)]">
      <div className="bg-brand px-5 py-4 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Leafs game centre</p>
        <h2 id="leafs-game-panel" className="mt-1 text-2xl font-black">Next / Last Game</h2>
      </div>

      {lastGame && (
        <div className="border-b border-slate-300 px-5 py-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Last game</p>
            <p className="text-xs font-semibold text-slate-500">{torontoDate.format(new Date(lastGame.startsAt))}</p>
          </div>
          <TeamScore {...lastGame.away} />
          <TeamScore {...lastGame.home} />
          {lastGame.resultType && lastGame.resultType !== 'REG' && (
            <p className="mt-1 text-right text-[10px] font-black uppercase text-slate-500">Final / {lastGame.resultType}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <ExternalLink href={lastGame.boxScoreUrl}>Box score</ExternalLink>
            {lastGame.condensedGameUrl && <ExternalLink href={lastGame.condensedGameUrl}>NHL condensed game</ExternalLink>}
          </div>
        </div>
      )}

      {nextGame && (
        <div className="px-5 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Next game</p>
          <p className="mt-2 text-xl font-black leading-tight text-brand">
            {nextGame.away.abbrev} <span className="text-slate-400">at</span> {nextGame.home.abbrev}
          </p>
          <p className="mt-1 text-sm font-bold text-brand">
            {torontoDate.format(new Date(nextGame.startsAt))} at {torontoTime.format(new Date(nextGame.startsAt))}
          </p>
          <dl className="mt-3 grid grid-cols-[52px_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs leading-5">
            <dt className="font-black uppercase text-slate-500">Arena</dt>
            <dd className="font-semibold text-slate-700">{nextGame.venue}</dd>
            <dt className="font-black uppercase text-slate-500">TV</dt>
            <dd className="font-semibold text-slate-700">{nextGame.tv.join(', ') || 'TBA'}</dd>
            <dt className="font-black uppercase text-slate-500">Radio</dt>
            <dd>{nextGame.radioUrl ? <ExternalLink href={nextGame.radioUrl}>Leafs radio stream</ExternalLink> : <span className="font-semibold text-slate-700">TBA</span>}</dd>
          </dl>
          <div className="mt-3 text-xs"><ExternalLink href={nextGame.boxScoreUrl}>Game centre</ExternalLink></div>

          {projectedLineup && (
            <details className="group mt-5 border-t border-slate-200 pt-4" open>
              <summary className="cursor-pointer list-none text-sm font-black text-brand marker:hidden">
                <span className="flex items-center justify-between">
                  Expected lines
                  <span aria-hidden="true" className="text-blue-600 transition-transform group-open:rotate-45">+</span>
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
                  {projectedLineup.updatedAt ? ` · Updated ${torontoDate.format(new Date(projectedLineup.updatedAt))}` : ''}
                </p>
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
