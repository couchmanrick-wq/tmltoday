import Link from 'next/link';
import Image from 'next/image';
import { NewsGrid, NewsList } from '@/components/content/NewsCard';
import { PlayerGrid } from '@/components/content/PlayerCard';
import { getTrendingPlayers } from '@/data/teams';
import { getForumThreads } from '@/lib/content';
import { formatTimeAgo } from '@/lib/format';
import { FORUM_URL } from '@/lib/site';
import { NewsArticle } from '@/types';

// Forum threads are read from D1 on each request, so render dynamically.
export const dynamic = 'force-dynamic';

// Mock data - replace with actual API calls
const FEATURED_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Leafs Sign New Forward in Mid-Season Trade',
    description: 'Toronto Maple Leafs management announces signing of promising forward in major trade deadline acquisition.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Trade News',
  },
  {
    id: '2',
    title: 'Auston Matthews Breaks Franchise Record',
    description: 'Leafs star reaches historic milestone, surpassing previous single-season scoring record.',
    source: 'Sportsnet',
    sourceUrl: 'https://sportsnet.ca',
    link: 'https://sportsnet.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'Highlights',
  },
  {
    id: '3',
    title: 'Post-Game Analysis: Leafs vs Capitals',
    description: 'Breaking down the Leafs comeback victory against Washington in thrilling overtime matchup.',
    source: 'The Hockey News',
    sourceUrl: 'https://thehockeynews.com',
    link: 'https://thehockeynews.com',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'Game Analysis',
  },
  {
    id: '4',
    title: 'Mitch Marner Interview: Leadership and Growth',
    description: 'Captain discusses team chemistry and pathway to playoff success in exclusive interview.',
    source: 'Sportsnet',
    sourceUrl: 'https://sportsnet.ca',
    link: 'https://sportsnet.ca',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'Interviews',
  },
  {
    id: '5',
    title: 'Behind the Scenes: Training Camp Footage',
    description: 'Exclusive footage from Leafs training facility showing preparation for upcoming playoff run.',
    source: 'Toronto Maple Leafs',
    sourceUrl: 'https://mapleleafs.nhl.com',
    link: 'https://mapleleafs.nhl.com',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'The Leafs Podcast: Season Preview 2024-25',
    description: 'Experts discuss expectations, roster changes, and playoff potential for the upcoming season.',
    source: 'Hockey Central',
    sourceUrl: 'https://podcasts.apple.com',
    link: 'https://podcasts.apple.com',
    contentType: 'podcast',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const RECENT_NEWS: NewsArticle[] = [
  ...FEATURED_NEWS.slice(0, 3),
  {
    id: '7',
    title: 'Injury Report: Updates on Injured Players',
    description: 'Team provides update on injured roster members ahead of next game.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function HomePage() {
  const trendingPlayers = getTrendingPlayers();
  const forumThreads = await getForumThreads(5);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      {/* Breaks out of the max-w-7xl container in (site)/layout.tsx so the
          artwork bleeds to both viewport edges. */}
      <section
        id="newsletter"
        className="relative isolate overflow-hidden scroll-mt-28 mx-[calc(50%-50vw)] w-screen"
      >
        {/* Decorative: the headline carries the meaning, so the image is alt="" */}
        <Image
          src="/images/matthews-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_60%] -z-10"
        />
        {/* Navy wash: opaque at the left so the headline always has contrast,
            clearing to the right so the player stays visible. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand from-25% via-brand/75 via-60% to-transparent" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:gap-12 md:py-20 lg:px-8">
          {/* Left: kicker + headline */}
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
              <span aria-hidden="true" className="h-0.5 w-8 bg-blue-300" />
              Your complete Maple Leafs coverage
            </p>
            <h1 className="text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
              <span className="block">Latest team news.</span>
              <span className="block text-blue-300">Up-to-the-minute.</span>
            </h1>
          </div>

          {/* Right: newsletter card */}
          <div>
            <div className="rounded-xl border border-white/15 bg-brand/60 p-5 backdrop-blur-sm sm:p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-300">
                ★ Free daily newsletter
              </p>
              <p className="mb-4 text-lg font-bold leading-snug text-white">
                The most recent Leafs and team updates, in your inbox by{' '}
                <span className="text-blue-300">7:00 AM EST</span>.
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

              <p className="mt-3 text-xs text-blue-200">
                One sharp email every morning. Join free — unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Content</h2>
          <Link
            href="/videos"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </Link>
        </div>
        <NewsGrid articles={FEATURED_NEWS.slice(0, 3)} cols={3} />
      </section>

      {/* Latest from the Forums */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Latest from the Forums</h2>
          <a
            href={FORUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </a>
        </div>

        {forumThreads.length === 0 ? (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-600 dark:text-slate-400">
            No forum threads to show right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forumThreads.map((thread) => (
              <a
                key={thread.url}
                href={thread.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <h3 className="font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {thread.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{thread.author ?? 'Forum'}</span>
                  <span>{formatTimeAgo(thread.publishedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Trending Players */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Trending Players</h2>
          <Link
            href="/players"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </Link>
        </div>
        <PlayerGrid players={trendingPlayers.slice(0, 4)} cols={4} />

        {/* Mentions Bar Chart */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h3 className="font-bold text-lg mb-6">Most Mentioned Players</h3>
          <div className="space-y-4">
            {trendingPlayers.slice(0, 8).map((player) => (
              <div key={player.id} className="flex items-center gap-4">
                <div className="w-32">
                  <p className="font-semibold text-sm">{player.name}</p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(((player.mentions || 0) / 150) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <p className="font-bold text-blue-600">{player.mentions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Latest News</h2>
          <Link
            href="/columns"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </Link>
        </div>
        <NewsList articles={RECENT_NEWS} />
      </section>

      {/* Standings Preview */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Standings</h2>
          <Link
            href="/standings"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Full Standings →
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Team</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">GP</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">W</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">L</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">OTL</th>
                <th className="text-center px-4 py-3 font-semibold">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {[
                { rank: 1, team: 'Toronto Maple Leafs', gp: 82, w: 48, l: 22, otl: 12, pts: 108 },
                { rank: 2, team: 'Tampa Bay Lightning', gp: 82, w: 46, l: 24, otl: 12, pts: 104 },
                { rank: 3, team: 'Boston Bruins', gp: 82, w: 44, l: 26, otl: 12, pts: 100 },
                { rank: 4, team: 'Montreal Canadiens', gp: 82, w: 42, l: 28, otl: 12, pts: 96 },
                { rank: 5, team: 'Detroit Red Wings', gp: 82, w: 40, l: 30, otl: 12, pts: 92 },
              ].map((row) => (
                <tr key={row.rank} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3 font-semibold">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold mr-2">
                      {row.rank}
                    </span>
                    {row.team}
                  </td>
                  <td className="text-center px-4 py-3 hidden sm:table-cell">{row.gp}</td>
                  <td className="text-center px-4 py-3 hidden sm:table-cell">{row.w}</td>
                  <td className="text-center px-4 py-3 hidden sm:table-cell">{row.l}</td>
                  <td className="text-center px-4 py-3 hidden sm:table-cell">{row.otl}</td>
                  <td className="text-center px-4 py-3 font-bold text-blue-600">{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Community Forum CTA */}
      <section className="py-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Discuss Leafs hockey with fans from across the world on our dedicated forum.
        </p>
        <a
          href={FORUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 transition-colors"
        >
          Visit the Forum →
        </a>
      </section>
    </div>
  );
}
