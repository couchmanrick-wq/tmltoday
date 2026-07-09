'use client';

import { NewsGrid } from '@/components/content/NewsCard';
import { NewsArticle } from '@/types';

// Mock podcast content
const PODCASTS: NewsArticle[] = [
  {
    id: 'p1',
    title: 'Leafs Talk: Championship Expectations',
    description: 'Deep dive into whether this is finally the year for Toronto.',
    source: 'TSN Podcasts',
    sourceUrl: 'https://podcasts.apple.com',
    link: 'https://podcasts.apple.com',
    contentType: 'podcast',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    title: 'The Hockey Show: Leafs Trade Deadline Review',
    description: 'Expert analysis of Toronto\'s playoff preparation moves.',
    source: 'Sportsnet',
    sourceUrl: 'https://podcasts.spotify.com',
    link: 'https://podcasts.spotify.com',
    contentType: 'podcast',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p3',
    title: 'Leafs Nation Podcast: Player Performance Analysis',
    description: 'Breaking down individual player statistics and contributions.',
    source: 'Leafs Nation',
    sourceUrl: 'https://podcasts.apple.com',
    link: 'https://podcasts.apple.com',
    contentType: 'podcast',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p4',
    title: 'Hockey Night in Canada: Weekly Wrap-up',
    description: 'Review of the week\'s Leafs games and upcoming matchups.',
    source: 'CBC Sports',
    sourceUrl: 'https://podcasts.apple.com',
    link: 'https://podcasts.apple.com',
    contentType: 'podcast',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function PodcastsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Podcasts</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Listen to the latest Leafs podcasts and audio analysis.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Podcasts</h2>
        <NewsGrid articles={PODCASTS} cols={3} />
      </div>
    </div>
  );
}
