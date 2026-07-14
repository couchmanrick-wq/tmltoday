import Link from 'next/link';
import { formatTimeAgo, sourceByline } from '@/lib/format';
import { NewsArticle } from '@/types';

export interface ProfileStat {
  label: string;
  value: string;
}

export interface ProfileSubject {
  /** Drives the eyebrow above the name. */
  kind: 'Player' | 'Prospect';
  name: string;
  headshot: string | null;
  position: string | null;
  number: number | null;
  teamLabel: string | null;
  /** GP/G/A/PTS for skaters, GP/W/L/SV% for goalies, latest career line for prospects. */
  stats: ProfileStat[];
  statsContext: string | null;
  /**
   * Base salary alone badly misrepresents a bonus-heavy deal — Matthews' base is $900k against
   * $11.08M of actual pay — so the total cash leads and the components explain it.
   */
  salary: {
    seasonLabel: string;
    total: string;
    base: string;
    signingBonus: string | null;
    capHit: string;
  } | null;
  reference: { label: string; href: string; note: string } | null;
  details: string[];
}

export function PlayerProfile({
  subject,
  stories,
  children,
}: {
  subject: ProfileSubject;
  stories: NewsArticle[];
  /** Extra panels between the header and the mentions feed — the prospect career table, say. */
  children?: React.ReactNode;
}) {
  const firstName = subject.name.split(/\s+/)[0] ?? subject.name;
  const news = stories.filter((story) => story.contentType === 'article' || story.contentType === 'blog');
  const videos = stories.filter((story) => story.contentType === 'video');
  const podcasts = stories.filter((story) => story.contentType === 'podcast');

  return (
    <div className="space-y-14">
      <header className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {subject.headshot && (
          // The NHL serves these as transparent mugshots, so they need no framing.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={subject.headshot}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full bg-blue-100 object-cover"
            loading="lazy"
          />
        )}

        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">{subject.kind}</p>
            <h1 className="text-4xl font-bold leading-tight text-brand sm:text-5xl">{subject.name}</h1>
          </div>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-blue-600">
            {subject.teamLabel && <span>{subject.teamLabel}</span>}
            {subject.position && <Dot />}
            {subject.position && <span>{subject.position}</span>}
            {subject.number != null && <Dot />}
            {subject.number != null && <span>#{subject.number}</span>}
          </p>

          {subject.stats.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              {subject.stats.map((stat) => (
                <p key={stat.label} className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-brand">{stat.value}</span>
                  <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                </p>
              ))}
              {subject.statsContext && (
                <span className="text-xs font-semibold text-slate-500">{subject.statsContext}</span>
              )}
            </div>
          )}

          {subject.salary && (
            <p className="text-sm font-bold text-slate-700">
              {`${subject.salary.seasonLabel} compensation (USD): ${subject.salary.total}`}
              <span className="font-semibold text-slate-500">
                {subject.salary.signingBonus
                  ? ` (${subject.salary.base} base + ${subject.salary.signingBonus} signing bonus)`
                  : ` (${subject.salary.base} base)`}
                {` · Cap hit: ${subject.salary.capHit} · Source: NHLPA`}
              </span>
            </p>
          )}

          {subject.details.length > 0 && (
            <p className="text-sm text-slate-600">{subject.details.join(' · ')}</p>
          )}

          {subject.reference && (
            <p className="border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-bold text-slate-700">Roster reference: </span>
              <a
                href={subject.reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                {subject.reference.label}
              </a>
              <span className="text-slate-500"> &middot; {subject.reference.note}</span>
            </p>
          )}
        </div>
      </header>

      {children}

      <section className="space-y-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
            Everything about {firstName}
          </p>
          <h2 className="text-3xl font-bold leading-tight text-brand sm:text-4xl">
            {stories.length === 0
              ? 'No mentions collected yet'
              : `${stories.length} ${stories.length === 1 ? 'mention' : 'mentions'} across news, video & podcasts`}
          </h2>
        </div>

        {stories.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
            Nothing in the feed mentions {subject.name} yet. This fills in as the aggregator picks up coverage.
          </p>
        ) : (
          <>
            <StoryGroup title="Podcast appearances" stories={podcasts} />
            <StoryGroup title="Video appearances" stories={videos} />
            <StoryGroup title="News coverage" stories={news} />
          </>
        )}
      </section>
    </div>
  );
}

function Dot() {
  return (
    <span className="text-slate-400" aria-hidden="true">
      &middot;
    </span>
  );
}

function StoryGroup({ title, stories }: { title: string; stories: NewsArticle[] }) {
  if (stories.length === 0) return null;

  return (
    <section className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        {title} ({stories.length})
      </h3>

      <div className="divide-y divide-slate-300 border-t border-slate-300">
        {stories.map((story) => (
          <StoryRow key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}

function StoryRow({ story }: { story: NewsArticle }) {
  return (
    <article className="py-7">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
        <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">{story.contentType}</span>
        <span className="text-slate-500">{story.source}</span>
      </div>

      <Link href={`/story/${story.id}`} className="group">
        <h4 className="text-2xl font-bold uppercase leading-tight text-brand group-hover:text-blue-500">
          {story.title}
        </h4>
      </Link>

      <p className="mt-3 text-base leading-7 text-slate-700">{story.aiSummary ?? story.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
        <span className="text-brand">{sourceByline(story)}</span>
        <span>{formatTimeAgo(story.publishedAt)}</span>
        <a
          href={story.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          {sourceVerb(story.contentType)} &rarr;
        </a>
      </div>
    </article>
  );
}

function sourceVerb(contentType: NewsArticle['contentType']) {
  if (contentType === 'podcast') return 'Listen at source';
  if (contentType === 'video') return 'Watch at source';

  return 'Read at source';
}
