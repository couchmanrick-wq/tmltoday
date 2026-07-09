'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatTimeAgo } from '@/lib/format';
import { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      {/* Image */}
      {article.image && (
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {/* Content Type Badge */}
      <div className="flex gap-2 mb-2">
        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
          {article.contentType.toUpperCase()}
        </span>
        {article.category && (
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded">
            {article.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {article.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
        {article.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">{article.source}</span>
        <span>{formatTimeAgo(article.publishedAt)}</span>
      </div>
    </a>
  );
}

interface NewsGridProps {
  articles: NewsArticle[];
  cols?: 1 | 2 | 3 | 4;
}

export function NewsGrid({ articles, cols = 3 }: NewsGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridClass[cols]}`}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

interface NewsListProps {
  articles: NewsArticle[];
}

export function NewsList({ articles }: NewsListProps) {
  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-all"
        >
          {article.image && (
            <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700 hidden sm:block">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex gap-2 mb-1">
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {article.contentType}
              </span>
            </div>
            <h3 className="font-semibold mb-1 hover:text-blue-600 dark:hover:text-blue-400">
              {article.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
              {article.description}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{article.source}</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
