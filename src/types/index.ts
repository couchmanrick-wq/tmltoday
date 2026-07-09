// Content types
export type ContentType = 'article' | 'video' | 'podcast' | 'tweet' | 'blog';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type StoryTopic =
  | 'breaking'
  | 'game'
  | 'injury'
  | 'trade'
  | 'rumour'
  | 'analysis'
  | 'prospects'
  | 'roster'
  | 'media'
  | 'community';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  link: string;
  image?: string;
  publishedAt: string;
  contentType: ContentType;
  category?: string;
  author?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  players?: string[];
  coaches?: string[];
  topic?: StoryTopic;
  isRumour?: boolean;
  rumourConfidence?: number;
  sentiment?: Sentiment;
  tags?: string[];
  duplicateOf?: string | null;
  importance?: number;
}

export interface ContentFeed {
  items: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NewsroomFeed {
  topStory?: NewsArticle;
  breaking: NewsArticle[];
  latest: NewsArticle[];
  trending: NewsArticle[];
  rumours: NewsArticle[];
  analysis: NewsArticle[];
  videos: NewsArticle[];
  podcasts: NewsArticle[];
  tweets: NewsArticle[];
}

// Player types
export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  team: string;
  image?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  birthplace?: string;
  shoots?: 'L' | 'R';
  mentions?: number;
}

// Team types
export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  logo?: string;
  founded?: number;
  description?: string;
}

// Game/Standings types
export interface GameResult {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  date: string;
  status: 'scheduled' | 'live' | 'final';
}

export interface StandingsEntry {
  team: Team;
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Forum/External content
export interface ForumThread {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  excerpt: string;
  replies: number;
  views: number;
  lastUpdated: string;
  link: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
