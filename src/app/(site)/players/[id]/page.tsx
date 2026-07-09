import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsList } from '@/components/content/NewsCard';
import { getEnrichedArticles } from '@/lib/aggregator/db';
import { FALLBACK_ARTICLES } from '@/lib/fallback-content';
import { LEAFS_ROSTER } from '@/data/teams';
import { NewsArticle } from '@/types';

export const dynamic = 'force-dynamic';

export default async function PlayerHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = LEAFS_ROSTER.find((item) => item.id === id);

  if (!player) notFound();

  const dbArticles = await getEnrichedArticles({ limit: 100 });
  const allArticles = dbArticles.length > 0 ? dbArticles : FALLBACK_ARTICLES;
  const playerStories = allArticles.filter((article) => (article.players ?? []).includes(player.name));
  const latestNews = playerStories.filter((article) => article.contentType === 'article' || article.contentType === 'blog');
  const videos = playerStories.filter((article) => article.contentType === 'video');
  const podcasts = playerStories.filter((article) => article.contentType === 'podcast');
  const rumours = playerStories.filter((article) => article.isRumour || article.topic === 'rumour');
  const injuries = playerStories.filter((article) => article.topic === 'injury');
  const timeline = buildTimeline(player.name, playerStories);

  return (
    <div className="space-y-10">
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/players" className="mb-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
          &lt;- All players
        </Link>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Player hub</p>
            <h1 className="text-4xl font-bold">{player.name}</h1>
            <p className="mt-2 text-slate-600">
              #{player.number} / {player.position} / {player.height ?? 'Height TBD'} / {player.weight ?? 'Weight TBD'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Buzz" value={String(playerStories.length || player.mentions || 0)} />
            <Metric label="Rumours" value={String(rumours.length)} />
            <Metric label="Media" value={String(videos.length + podcasts.length)} />
          </div>
        </div>
      </header>

      <HubSection title="Latest News">
        <StoryLane stories={latestNews} empty={`No indexed news mentions ${player.name} yet.`} />
      </HubSection>

      <section className="grid gap-8 lg:grid-cols-2">
        <HubSection title="Videos">
          <StoryLane stories={videos} empty={`No videos are tagged to ${player.name} yet.`} />
        </HubSection>
        <HubSection title="Podcasts">
          <StoryLane stories={podcasts} empty={`No podcast episodes are tagged to ${player.name} yet.`} />
        </HubSection>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <HubSection title="Stats">
          <StatsPanel playerName={player.name} />
        </HubSection>
        <HubSection title="Injury History">
          <StoryLane stories={injuries} empty="No indexed injury items yet. A dedicated injury-history feed can populate this section." />
        </HubSection>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <HubSection title="Rumours">
          <StoryLane stories={rumours} empty={`No active rumours are tagged to ${player.name} right now.`} />
        </HubSection>
        <HubSection title="Contract">
          <ContractPanel />
        </HubSection>
      </section>

      <HubSection title="Career Timeline">
        <TimelinePanel playerName={player.name} items={timeline} />
      </HubSection>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-blue-50 px-4 py-3 text-center">
      <p className="text-xs font-bold uppercase text-blue-800">{label}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function HubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function StoryLane({ stories, empty }: { stories: NewsArticle[]; empty: string }) {
  if (stories.length === 0) return <EmptyPanel>{empty}</EmptyPanel>;

  return <NewsList articles={stories.slice(0, 8)} />;
}

function StatsPanel({ playerName }: { playerName: string }) {
  const rows = [
    ['Games', 'TBD'],
    ['Goals', 'TBD'],
    ['Assists', 'TBD'],
    ['Points', 'TBD'],
    ['Shots', 'TBD'],
    ['Average TOI', 'TBD'],
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-slate-200 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{value}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-slate-200 p-4 text-sm text-slate-600">
        NHL stats adapter pending for {playerName}.
      </p>
    </div>
  );
}

function ContractPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <dl className="grid gap-4 sm:grid-cols-2">
        <ContractItem label="Status" value="Data feed pending" />
        <ContractItem label="Cap hit" value="TBD" />
        <ContractItem label="Expires" value="TBD" />
        <ContractItem label="Clauses" value="TBD" />
      </dl>
      <p className="mt-5 text-sm text-slate-600">
        This section is ready for a contract adapter such as PuckPedia, CapWages, or a maintained internal table.
      </p>
    </div>
  );
}

function ContractItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function TimelinePanel({ playerName, items }: { playerName: string; items: Array<{ title: string; detail: string }> }) {
  if (items.length === 0) {
    return <EmptyPanel>Career timeline feed pending for {playerName}.</EmptyPanel>;
  }

  return (
    <ol className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {items.map((item) => (
        <li key={`${item.title}-${item.detail}`} className="flex gap-3 border-l border-slate-200 pb-6 pl-5 last:pb-0">
          <span className="-ml-[27px] mt-1 h-3 w-3 rounded-full bg-blue-600" />
          <div>
            <p className="font-bold">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      {children}
    </div>
  );
}

function buildTimeline(playerName: string, stories: NewsArticle[]) {
  return stories.slice(0, 6).map((story) => ({
    title: story.category ?? story.topic ?? 'Story',
    detail: `${playerName} mentioned by ${story.source}: ${story.title}`,
  }));
}
