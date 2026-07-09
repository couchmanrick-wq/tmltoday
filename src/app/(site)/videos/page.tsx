'use client';

import { NewsGrid } from '@/components/content/NewsCard';
import { NewsArticle } from '@/types';

// Mock video content
const VIDEOS: NewsArticle[] = [
  {
    id: 'v1',
    title: 'Full Game Highlights: Leafs vs Lightning',
    description: 'Watch the complete highlights from the thrilling matchup between Toronto and Tampa Bay.',
    source: 'Toronto Maple Leafs',
    sourceUrl: 'https://youtube.com',
    link: 'https://youtube.com',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Highlights',
  },
  {
    id: 'v2',
    title: 'Auston Matthews Post-Game Interview',
    description: 'Star forward discusses his hat trick performance and team momentum.',
    source: 'Sportsnet',
    sourceUrl: 'https://sportsnet.ca',
    link: 'https://sportsnet.ca',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'Interviews',
  },
  {
    id: 'v3',
    title: 'Coach Treliving Strategy Breakdown',
    description: 'Coach explains the offensive adjustments that led to the big win.',
    source: 'TSN',
    sourceUrl: 'https://tsn.ca',
    link: 'https://tsn.ca',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'Analysis',
  },
  {
    id: 'v4',
    title: 'Behind the Scenes: Training Camp Day 1',
    description: 'Exclusive look at Leafs preparation for the new season.',
    source: 'Toronto Maple Leafs',
    sourceUrl: 'https://youtube.com',
    link: 'https://youtube.com',
    contentType: 'video',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export default function VideosPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Videos</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Watch the latest Leafs highlights, interviews, and analysis.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
        <NewsGrid articles={VIDEOS} cols={3} />
      </div>
    </div>
  );
}
