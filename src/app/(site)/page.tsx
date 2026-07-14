import Link from 'next/link';
import { getTrendingPlayers, playerSlug } from '@/data/teams';
import { SiteHero } from '@/components/layout/SiteHero';
import { Pagination } from '@/components/content/Pagination';
import {
  ForumMembersOnline,
  ForumThread,
  getForumSidebarWidgets,
  getForumThreads,
} from '@/lib/content';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';
import { formatTimeAgo, sourceByline } from '@/lib/format';
import { getRosterStats, statsSeasonLabel } from '@/lib/leafs-stats';
import { getArticlePage, parsePageParam } from '@/lib/pagination';
import { FilterNav } from '@/components/layout/FilterNav';
import { NewsletterCard } from '@/components/layout/NewsletterCard';
import { NewsArticle } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/' } };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const feed = await getArticlePage(
    { orderBy: 'published', excludeDuplicates: true },
    parsePageParam(page),
    FALLBACK_ARTICLES
  );
  const trendingPlayers = getTrendingPlayers();
  const forumThreads = await getForumThreads(9);
  const forumSidebar = await getForumSidebarWidgets();
  const rosterStats = await getRosterStats();
  const latestItems = feed.articles;
  const itemCount = feed.total.toLocaleString();

  return (
    <div className="-mt-8 mx-[calc(50%-50vw)] min-h-screen bg-[#fbf9ff]">
      <SiteHero />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8">
        <main className="min-w-0">
          <div className="mb-10">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                The latest
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand sm:text-5xl">
                Around the Leafs
              </h1>
            </div>
          </div>

          <div className="mb-6 flex items-end justify-between gap-4 lg:border-b lg:border-slate-300">
            <FilterNav />
            <p className="hidden pb-4 text-xs font-bold uppercase tracking-wide text-slate-500 lg:block">
              {itemCount} items
            </p>
          </div>

          <section aria-label="Latest stories" className="divide-y divide-slate-300">
            {latestItems.map((article, index) => (
              <FeedItem key={article.id} article={article} featured={feed.page === 1 && index === 0} />
            ))}
          </section>

          <div className="mt-10">
            <Pagination page={feed.page} pageCount={feed.pageCount} basePath="/" />
          </div>
        </main>

        <aside className="min-w-0 space-y-10">
          <SearchBox />

          <NewsletterCard />

          <RailSection
            title="Trending players"
            action={<span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">Buzz</span>}
          >
            <div className="divide-y divide-slate-300">
              {trendingPlayers.slice(0, 10).map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${playerSlug(player.name)}`}
                  className="flex items-center justify-between gap-2 py-3 text-brand hover:text-blue-500"
                >
                  <span className="font-bold">{player.name}</span>
                  <span className="shrink-0 text-sm font-bold text-blue-500">
                    {player.mentions ?? 0}{' '}
                    <span className="text-[10px] uppercase text-slate-500">mentions</span>
                  </span>
                </Link>
              ))}
            </div>
          </RailSection>

          <ForumPosts threads={forumThreads} />

          <MembersOnline data={forumSidebar.membersOnline} />

          <RailSection
            title="Player stats"
            action={rosterStats.season ? <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{statsSeasonLabel(rosterStats.season)}</span> : undefined}
          >
            {rosterStats.players.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-300 text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="py-3 text-left">Player</th>
                    <th className="py-3 text-right">GP</th>
                    <th className="py-3 text-right">G</th>
                    <th className="py-3 text-right">A</th>
                    <th className="py-3 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {rosterStats.players.map((player, i) => (
                    <tr key={player.id}>
                      <td className="py-3 font-bold text-brand">
                        <span className="mr-2 text-blue-500">{i + 1}</span>
                        {player.name}
                      </td>
                      <td className="py-3 text-right text-slate-600">{player.gamesPlayed}</td>
                      <td className="py-3 text-right text-slate-600">{player.goals}</td>
                      <td className="py-3 text-right text-slate-600">{player.assists}</td>
                      <td className="py-3 text-right font-bold text-brand">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="py-3 text-sm text-slate-500">Player stats will appear once the season starts.</p>}
          </RailSection>
        </aside>
      </div>
    </div>
  );
}

function FeedItem({ article, featured }: { article: NewsArticle; featured?: boolean }) {
  return (
    <article className="grid gap-5 py-7 sm:grid-cols-[minmax(0,1fr)_48px] sm:items-center">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          <span>{article.contentType}:</span>
          <span>{article.source}</span>
        </div>

        <Link href={`/story/${article.id}`} className="group">
          <h2
            className={[
              'font-bold leading-tight text-brand group-hover:text-blue-500',
              featured ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
            ].join(' ')}
          >
            {article.title}
          </h2>
        </Link>

        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          {article.aiSummary ?? article.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="text-brand">{sourceByline(article)}</span>
          <span>{formatTimeAgo(article.publishedAt)}</span>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            Read at source -&gt;
          </a>
        </div>
      </div>

      <Link
        href={`/story/${article.id}`}
        aria-label={`Open ${article.title}`}
        className={[
          'hidden h-9 w-9 items-center justify-center rounded-full border text-xl font-bold sm:flex',
          featured ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-slate-500',
        ].join(' ')}
      >
        -&gt;
      </Link>
    </article>
  );
}

function RailSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t-4 border-brand pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold leading-tight text-brand">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CompactStoryList({ stories }: { stories: NewsArticle[] }) {
  if (stories.length === 0) {
    return <p className="border-t border-slate-300 py-4 text-sm text-slate-600">No active rumours right now.</p>;
  }

  return (
    <div className="divide-y divide-slate-300">
      {stories.map((story) => (
        <Link key={story.id} href={`/story/${story.id}`} className="block py-3 hover:text-blue-500">
          <p className="text-sm font-bold leading-snug text-brand">{story.title}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{story.source}</p>
        </Link>
      ))}
    </div>
  );
}

function ForumPosts({ threads }: { threads: ForumThread[] }) {
  return (
    <ForumRail title="Latest posts">
      {threads.length === 0 ? (
        <p className="border-t border-slate-300 py-4 text-sm text-slate-600">No forum posts to show right now.</p>
      ) : (
        <div className="divide-y divide-slate-300">
          {threads.map((thread) => (
            <a
              key={thread.url}
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 py-3 hover:text-blue-500"
            >
              <span className="mt-1 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-[10px] font-bold uppercase text-brand">
                {thread.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thread.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  getInitials(thread.author ?? thread.title)
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-bold leading-snug text-brand">
                  {thread.title}
                </span>
                <span className="mt-1 block text-sm leading-snug text-slate-600">
                  Latest: {thread.author ?? 'Forum'} · {thread.displayTime ?? formatTimeAgo(thread.publishedAt)}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-500">
                  {thread.forumName ?? 'TML Today Community'}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </ForumRail>
  );
}

function MembersOnline({ data }: { data: ForumMembersOnline | null }) {
  return (
    <ForumRail title="Members online">
      {!data || data.members.length === 0 ? (
        <p className="border-t border-slate-300 py-4 text-sm text-slate-600">No members online right now.</p>
      ) : (
        <>
          <div className="border-b border-slate-300 py-4">
            <p className="mb-3 text-sm font-semibold">
              <span className="text-green-700">Members</span>
              <span className="text-slate-500"> &amp; </span>
              <span className="text-red-600">Staff</span>
            </p>
            <p className="text-sm leading-6 text-slate-700">
              {data.members.map((member, index) => (
                <span key={member.url ?? `${member.name}-${index}`}>
                  {member.url ? (
                    <a
                      href={member.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[
                        'font-semibold hover:text-blue-500',
                        member.isStaff ? 'text-red-600' : 'text-green-700',
                      ].join(' ')}
                    >
                      {member.name}
                    </a>
                  ) : (
                    <span className={['font-semibold', member.isStaff ? 'text-red-600' : 'text-green-700'].join(' ')}>
                      {member.name}
                    </span>
                  )}
                  {index < data.members.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
          {data.totalLabel && (
            <p className="py-3 text-sm text-slate-700">{data.totalLabel}</p>
          )}
        </>
      )}
    </ForumRail>
  );
}

function ForumRail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t-4 border-brand pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-tight text-brand">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Avatar({ src, label }: { src: string | null; label: string }) {
  return (
    <span className="mt-1 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-[10px] font-bold uppercase text-brand">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        getInitials(label)
      )}
    </span>
  );
}

function SearchBox() {
  return (
    <form action="/news" className="flex h-12 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <label htmlFor="front-search" className="sr-only">
        Search players, teams, topics
      </label>
      <span className="flex w-11 items-center justify-center text-slate-500" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        id="front-search"
        name="q"
        type="search"
        placeholder="Search players, teams, topics..."
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
      />
      <button type="submit" className="m-1 rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500">
        Go
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m14.2 14.2 3.3 3.3M8.8 15.2a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

