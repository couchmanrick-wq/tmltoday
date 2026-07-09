import { NewsGrid, NewsList } from '@/components/content/NewsCard';
import { NewsArticle } from '@/types';

// Mock news data - replace with actual feed aggregation
const NEWS: NewsArticle[] = [
  {
    id: 'news1',
    title: 'Leafs Sign New Forward in Mid-Season Trade',
    description:
      'Toronto Maple Leafs management announces signing of promising forward in major trade deadline acquisition.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Trade News',
  },
  {
    id: 'news2',
    title: 'Auston Matthews Breaks Franchise Record',
    description:
      'Leafs star reaches historic milestone, surpassing previous single-season scoring record.',
    source: 'Sportsnet',
    sourceUrl: 'https://sportsnet.ca',
    link: 'https://sportsnet.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'Highlights',
  },
  {
    id: 'news3',
    title: 'Post-Game Analysis: Leafs vs Capitals',
    description:
      'Breaking down the Leafs comeback victory against Washington in thrilling overtime matchup.',
    source: 'The Hockey News',
    sourceUrl: 'https://thehockeynews.com',
    link: 'https://thehockeynews.com',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'Game Analysis',
  },
  {
    id: 'news4',
    title: 'Injury Report: Updates on Injured Players',
    description: 'Team provides update on injured roster members ahead of next game.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    category: 'Injuries',
  },
  {
    id: 'news5',
    title: 'Prospect Watch: Marlies Callups to Watch',
    description:
      'The AHL affiliate is producing again, and a few names are pushing hard for a look with the big club.',
    source: 'Leafs Nation',
    sourceUrl: 'https://theleafsnation.com',
    link: 'https://theleafsnation.com',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    category: 'Prospects',
  },
  {
    id: 'news6',
    title: 'Special Teams Are Quietly Carrying the Leafs',
    description:
      'The power play has climbed the league rankings, and the penalty kill is no longer a liability.',
    source: 'Sportsnet',
    sourceUrl: 'https://sportsnet.ca',
    link: 'https://sportsnet.ca',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    category: 'Game Analysis',
  },
];

export const metadata = {
  title: 'News - TML Today',
  description: 'The latest Toronto Maple Leafs news from across the hockey world.',
};

export default function NewsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">News</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The latest Toronto Maple Leafs news from across the hockey world.
        </p>
      </div>

      {/* Top stories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Top Stories</h2>
        <NewsGrid articles={NEWS.slice(0, 3)} cols={3} />
      </section>

      {/* Everything else */}
      <section>
        <h2 className="text-2xl font-bold mb-6">More News</h2>
        <NewsList articles={NEWS.slice(3)} />
      </section>
    </div>
  );
}
