import Link from 'next/link';
import Image from 'next/image';
import { getTrendingPlayers } from '@/data/teams';
import { getNewsroomFeed } from '@/lib/aggregator/db';
import { ForumThread, getForumThreads } from '@/lib/content';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';
import { formatTimeAgo } from '@/lib/format';
import { NewsArticle, NewsroomFeed } from '@/types';

export const dynamic = 'force-dynamic';

const STANDINGS_PREVIEW = [
  { rank: 1, team: 'Toronto Maple Leafs', gp: 82, pts: 108 },
  { rank: 2, team: 'Tampa Bay Lightning', gp: 82, pts: 104 },
  { rank: 3, team: 'Boston Bruins', gp: 82, pts: 100 },
  { rank: 4, team: 'Montreal Canadiens', gp: 82, pts: 96 },
  { rank: 5, team: 'Detroit Red Wings', gp: 82, pts: 92 },
];

export default async function HomePage() {
  const newsroom = withFallbackFeed(await getNewsroomFeed());
  const trendingPlayers = getTrendingPlayers();
  const forumThreads = await getForumThreads(9);
  const latestItems = getLatestItems(newsroom);
  const itemCount = latestItems.length.toLocaleString();

  return (
    <div className="-mt-8 mx-[calc(50%-50vw)] min-h-screen bg-[#fbf9ff]">
      <section id="newsletter" className="relative isolate overflow-hidden scroll-mt-28">
        <Image
          src="/images/front-page-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_42%] -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-brand/65 md:bg-transparent md:bg-gradient-to-r md:from-brand/70 md:from-45% md:via-brand/30 md:via-62% md:to-transparent md:to-80%" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 hidden opacity-50 md:block md:bg-[radial-gradient(ellipse_58%_85%_at_24%_50%,var(--brand)_0%,transparent_70%)]"
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:gap-12 md:py-20 lg:px-8">
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
              <span aria-hidden="true" className="h-0.5 w-8 bg-white" />
              Your complete Maple Leafs coverage
            </p>
            <h1 className="text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
              <span className="block">Latest team news.</span>
              <span className="block text-blue-100">Up-to-the-minute.</span>
            </h1>
          </div>

          <div>
            <div className="rounded-xl border border-white/20 bg-brand/35 p-5 backdrop-blur-sm backdrop-brightness-[.45] sm:p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-300">
                Free daily newsletter
              </p>
              <p className="mb-4 text-lg font-bold leading-snug text-white">
                Latest Leafs News to your inbox by{' '}
                <span className="underline decoration-blue-300 decoration-2 underline-offset-4">
                  7:00 AM EST
                </span>
                .
              </p>

              <form className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="hero-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="hero-email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 rounded bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded bg-blue-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand transition-colors hover:bg-blue-200"
                >
                  Get the 7 AM recap
                </button>
              </form>

              <p className="mt-3 text-xs text-blue-100">
                One sharp email every morning. Join free - unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8">
        <main>
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

          <div className="mb-6 flex items-end justify-between border-b border-slate-300">
            <nav aria-label="Content filters" className="flex gap-7">
              <FilterTab href="/" label="All" active />
              <FilterTab href="/news?type=article" label="News" />
              <FilterTab href="/videos" label="Videos" />
              <FilterTab href="/podcasts" label="Podcasts" />
              <FilterTab href="/news?type=blog" label="Blogs" />
            </nav>
            <p className="hidden pb-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:block">
              {itemCount} items
            </p>
          </div>

          <section aria-label="Latest stories" className="divide-y divide-slate-300">
            {latestItems.map((article, index) => (
              <FeedItem key={article.id} article={article} featured={index === 0} />
            ))}
          </section>
        </main>

        <aside className="space-y-10">
          <SearchBox />

          <RailSection
            title="Trending players"
            action={<span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">Buzz</span>}
          >
            <div className="divide-y divide-slate-300">
              {trendingPlayers.slice(0, 10).map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center justify-between py-3 text-brand hover:text-blue-500"
                >
                  <span className="font-bold">{player.name}</span>
                  <span className="text-sm font-bold text-blue-500">
                    {player.mentions ?? 0}{' '}
                    <span className="text-[10px] uppercase text-slate-500">mentions</span>
                  </span>
                </Link>
              ))}
            </div>
          </RailSection>

          <ForumPosts threads={forumThreads} />

          <RailSection
            title="Standings"
            action={<span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">2025-26</span>}
          >
            <table className="w-full text-sm">
              <thead className="border-b border-slate-300 text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Team</th>
                  <th className="py-3 text-right">GP</th>
                  <th className="py-3 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {STANDINGS_PREVIEW.map((row) => (
                  <tr key={row.team}>
                    <td className="py-3 font-bold text-brand">
                      <span className="mr-2 text-blue-500">{row.rank}</span>
                      {row.team}
                    </td>
                    <td className="py-3 text-right text-slate-600">{row.gp}</td>
                    <td className="py-3 text-right font-bold text-brand">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RailSection>

          <RailSection title="Rumours">
            <CompactStoryList stories={newsroom.rumours.slice(0, 4)} />
          </RailSection>

          <RailSection title="Newsletter">
            <form className="space-y-3">
              <label htmlFor="rail-email" className="sr-only">
                Email address
              </label>
              <input
                id="rail-email"
                type="email"
                required
                placeholder="you@email.com"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button type="submit" className="h-11 w-full rounded-md bg-blue-600 text-sm font-bold text-white hover:bg-blue-500">
                Get the 7 AM recap
              </button>
            </form>
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
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">{article.topic ?? article.contentType}</span>
          <span>{article.contentType}</span>
          <span>{article.source}</span>
          {article.isRumour && (
            <span className="text-amber-700">{article.rumourConfidence ?? 0}% confidence</span>
          )}
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
          <span className="text-brand">{article.source}</span>
          <span>By {article.author ?? article.source}</span>
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

function FilterTab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'border-b-2 pb-4 text-xs font-bold uppercase tracking-[0.12em]',
        active ? 'border-blue-600 text-brand' : 'border-transparent text-slate-500 hover:text-brand',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

function RailSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t-4 border-brand pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand">{title}</h2>
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
    <section className="overflow-hidden border border-slate-300 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <span className="text-brand" aria-hidden="true">
          <PencilIcon />
        </span>
        <h2 className="text-lg font-bold uppercase text-brand">Latest posts</h2>
      </div>

      {threads.length === 0 ? (
        <p className="px-4 py-5 text-sm text-slate-600">No forum posts to show right now.</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {threads.map((thread) => (
            <a
              key={thread.url}
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[26px_minmax(0,1fr)] gap-3 px-4 py-3 hover:bg-blue-50/70"
            >
              <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold uppercase text-brand">
                {getInitials(thread.author ?? thread.title)}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold leading-snug text-brand">
                  {thread.title}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-600">
                  Latest: {thread.author ?? 'Forum'} · {formatTimeAgo(thread.publishedAt)}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-500">
                  TML Today Community
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
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

function PencilIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.2 13.8 3.5 16.5l2.7-.7 8.6-8.6-2-2-8.6 8.6ZM12 4l1.1-1.1a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2L15 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function getLatestItems(feed: NewsroomFeed) {
  const byId = new Map<string, NewsArticle>();
  const orderedGroups = [feed.latest, feed.breaking, feed.trending, feed.analysis, feed.videos, feed.podcasts, feed.rumours];

  for (const group of orderedGroups) {
    for (const article of group) {
      byId.set(article.id, article);
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 18);
}

function withFallbackFeed(feed: NewsroomFeed): NewsroomFeed {
  if (feed.topStory) return feed;

  return {
    topStory: FALLBACK_ARTICLES[0],
    breaking: FALLBACK_ARTICLES.filter((article) => article.topic === 'breaking'),
    latest: FALLBACK_ARTICLES,
    trending: FALLBACK_ARTICLES,
    rumours: FALLBACK_ARTICLES.filter((article) => article.isRumour),
    analysis: FALLBACK_ARTICLES.filter((article) => article.topic === 'analysis'),
    videos: FALLBACK_ARTICLES.filter((article) => article.contentType === 'video'),
    podcasts: FALLBACK_ARTICLES.filter((article) => article.contentType === 'podcast'),
    tweets: FALLBACK_ARTICLES.filter((article) => article.contentType === 'tweet'),
  };
}
