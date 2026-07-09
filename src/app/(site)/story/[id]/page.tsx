import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEnrichedArticleById, getEnrichedArticles } from '@/lib/aggregator/db';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';
import { formatTimeAgo } from '@/lib/format';
import { NewsArticle } from '@/types';

export const dynamic = 'force-dynamic';

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbStory = await getEnrichedArticleById(id);
  const story = dbStory ?? FALLBACK_ARTICLES.find((article) => article.id === id);

  if (!story) notFound();

  const dbArticles = await getEnrichedArticles({ limit: 80 });
  const pool = dbArticles.length > 0 ? dbArticles : FALLBACK_ARTICLES;
  const related = getRelatedStories(story, pool).slice(0, 4);
  const relatedVideos = related.filter((article) => article.contentType === 'video').slice(0, 3);
  const relatedPodcasts = related.filter((article) => article.contentType === 'podcast').slice(0, 3);

  return (
    <article className="space-y-10">
      <header className="space-y-5">
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">{story.topic ?? story.contentType}</span>
          {story.isRumour && (
            <span className="rounded bg-amber-100 px-2 py-1 text-amber-900">
              Rumour confidence {story.rumourConfidence ?? 0}%
            </span>
          )}
        </div>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight">{story.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>{story.source}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={story.publishedAt}>{formatTimeAgo(story.publishedAt)}</time>
          {story.sentiment && (
            <>
              <span aria-hidden="true">/</span>
              <span>{story.sentiment} sentiment</span>
            </>
          )}
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">AI Summary</h2>
            <p className="text-lg leading-8 text-slate-700">{story.aiSummary ?? story.description}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Key Takeaways</h2>
            <ul className="space-y-3 text-slate-700">
              {(story.keyTakeaways ?? []).map((takeaway) => (
                <li key={takeaway} className="border-l-4 border-blue-200 pl-3">
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Timeline</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                <div>
                  <p className="font-semibold">Story discovered</p>
                  <p className="text-sm text-slate-600">{formatTimeAgo(story.publishedAt)} from {story.source}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-blue-300" />
                <div>
                  <p className="font-semibold">AI newsroom enrichment</p>
                  <p className="text-sm text-slate-600">Players, topic, tags, duplicates, sentiment, and importance were assigned.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <aside className="space-y-6">
          <a
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded bg-blue-600 px-5 py-3 text-center font-bold text-white transition-colors hover:bg-blue-500"
          >
            Original Source
          </a>

          <MetaBox title="Player Tags" items={story.players ?? []} />
          <MetaBox title="Tags" items={story.tags ?? []} />

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Comments</h2>
            <p className="text-sm text-slate-600">Comment threads can attach here once authentication and moderation are enabled.</p>
          </div>
        </aside>
      </section>

      <StoryRail title="Related Stories" stories={related} />
      <StoryRail title="Related Videos" stories={relatedVideos} />
      <StoryRail title="Related Podcasts" stories={relatedPodcasts} />
    </article>
  );
}

function MetaBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">None detected.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryRail({ title, stories }: { title: string; stories: NewsArticle[] }) {
  if (stories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">{story.source}</p>
            <h3 className="text-base font-bold leading-snug">{story.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getRelatedStories(story: NewsArticle, articles: NewsArticle[]) {
  const storyTags = new Set<string>(
    [...(story.tags ?? []), ...(story.players ?? []), story.topic].filter((tag): tag is string => Boolean(tag))
  );

  return articles
    .filter((article) => article.id !== story.id)
    .map((article) => ({
      article,
      score: [...storyTags].filter((tag) => (article.tags ?? []).includes(tag) || (article.players ?? []).includes(tag)).length + (article.topic === story.topic ? 2 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.article.importance ?? 0) - (a.article.importance ?? 0))
    .map(({ article }) => article);
}
