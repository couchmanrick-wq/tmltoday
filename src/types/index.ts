// Content types
export type ContentType = 'article' | 'video' | 'podcast' | 'tweet' | 'blog';

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
}

export interface ContentFeed {
  items: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
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
