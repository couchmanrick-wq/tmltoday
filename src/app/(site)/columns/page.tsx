'use client';

import { NewsList } from '@/components/content/NewsCard';
import { NewsArticle } from '@/types';

// Mock column data
const COLUMNS: NewsArticle[] = [
  {
    id: 'col1',
    title: 'Are the Leafs Finally Ready for Stanley Cup Glory?',
    description:
      'An in-depth analysis of the roster construction and playoff preparedness as we head into the final stretch of the season.',
    source: 'Daily Buzz',
    sourceUrl: '#',
    link: '#',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: 'John Smith',
    category: 'Opinion',
  },
  {
    id: 'col2',
    title: 'The Trade Deadline: What Did it Mean for Toronto?',
    description:
      'Breaking down every move the Leafs made and didn\'t make at the deadline, and what it says about their championship window.',
    source: 'Hockey Analysis Weekly',
    sourceUrl: '#',
    link: '#',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    author: 'Jane Doe',
    category: 'Trade Analysis',
  },
  {
    id: 'col3',
    title: 'Auston Matthews\' Evolution as a Leader',
    description:
      'Exploring how the Leafs captain has grown into his leadership role and what it means for team chemistry.',
    source: 'Leafs Nation',
    sourceUrl: '#',
    link: '#',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    author: 'Mike Johnson',
    category: 'Player Analysis',
  },
  {
    id: 'col4',
    title: 'Depth Scoring: The Key to Playoff Success',
    description:
      'How secondary scoring lines have become critical to the Leafs\' championship aspirations.',
    source: 'Daily Buzz',
    sourceUrl: '#',
    link: '#',
    contentType: 'article',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: 'Sarah Williams',
    category: 'Strategy',
  },
];

export default function ColumnsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Columns & Analysis</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Expert opinions and in-depth analysis of the Toronto Maple Leafs.
        </p>
      </div>

      {/* Featured Column */}
      {COLUMNS.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8 border-l-4 border-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded">
              FEATURED
            </span>
            <span className="px-3 py-1 text-xs font-bold bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded">
              {COLUMNS[0].category}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-3">{COLUMNS[0].title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {COLUMNS[0].description}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>
                By <span className="font-semibold">{COLUMNS[0].author}</span>
              </p>
              <p>{COLUMNS[0].source}</p>
            </div>
            <a
              href={COLUMNS[0].link}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              Read More
            </a>
          </div>
        </section>
      )}

      {/* All Columns */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Latest Columns</h2>
        <NewsList articles={COLUMNS.slice(1)} />
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Opinion', 'Trade Analysis', 'Player Analysis', 'Strategy'].map(
            (category) => (
              <button
                key={category}
                className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all text-left font-semibold"
              >
                {category}
              </button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
