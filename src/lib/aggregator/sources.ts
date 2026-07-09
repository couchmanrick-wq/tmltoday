import { ContentType } from '@/types';

export type SourceKind =
  | 'official'
  | 'newspaper'
  | 'sports-media'
  | 'hockey-site'
  | 'leafs-blog'
  | 'sports-site'
  | 'podcast'
  | 'youtube'
  | 'radio'
  | 'television';

export interface AggregatorSource {
  id: string;
  name: string;
  kind: SourceKind;
  url: string;
  feedUrl?: string;
  contentType: ContentType;
  priority: number;
}

export const AGGREGATOR_SOURCES: AggregatorSource[] = [
  { id: 'nhl-leafs', name: 'Toronto Maple Leafs', kind: 'official', url: 'https://www.nhl.com/mapleleafs', feedUrl: 'https://www.nhl.com/mapleleafs/rss/news', contentType: 'article', priority: 100 },
  { id: 'nhl', name: 'NHL.com', kind: 'official', url: 'https://www.nhl.com', feedUrl: 'https://www.nhl.com/rss/news', contentType: 'article', priority: 90 },
  { id: 'the-hockey-news', name: 'The Hockey News', kind: 'hockey-site', url: 'https://thehockeynews.com', feedUrl: 'https://thehockeynews.com/.rss/full/', contentType: 'article', priority: 82 },
  { id: 'daily-faceoff', name: 'Daily Faceoff', kind: 'hockey-site', url: 'https://www.dailyfaceoff.com', feedUrl: 'https://www.dailyfaceoff.com/feed', contentType: 'article', priority: 78 },
  { id: 'the-hockey-writers', name: 'The Hockey Writers', kind: 'hockey-site', url: 'https://thehockeywriters.com', feedUrl: 'https://thehockeywriters.com/feed/', contentType: 'article', priority: 74 },
  { id: 'maple-leafs-hot-stove', name: 'Maple Leafs Hot Stove', kind: 'leafs-blog', url: 'https://mapleleafshotstove.com', feedUrl: 'https://mapleleafshotstove.com/feed/', contentType: 'blog', priority: 76 },
  { id: 'the-leafs-nation', name: 'The Leafs Nation', kind: 'leafs-blog', url: 'https://theleafsnation.com', feedUrl: 'https://theleafsnation.com/feed/', contentType: 'blog', priority: 72 },
  { id: 'pension-plan-puppets', name: 'Pension Plan Puppets', kind: 'leafs-blog', url: 'https://www.pensionplanpuppets.com', feedUrl: 'https://www.pensionplanpuppets.com/rss/index.xml', contentType: 'blog', priority: 68 },
  { id: 'editor-in-leaf', name: 'Editor In Leaf', kind: 'leafs-blog', url: 'https://editorinleaf.com', feedUrl: 'https://editorinleaf.com/feed/', contentType: 'blog', priority: 64 },
  { id: 'tsn', name: 'TSN', kind: 'sports-media', url: 'https://www.tsn.ca', feedUrl: 'https://www.tsn.ca/rss', contentType: 'article', priority: 82 },
  { id: 'sportsnet', name: 'Sportsnet', kind: 'sports-media', url: 'https://www.sportsnet.ca', feedUrl: 'https://www.sportsnet.ca/feed/', contentType: 'article', priority: 82 },
  { id: 'the-score', name: 'theScore', kind: 'sports-site', url: 'https://www.thescore.com', feedUrl: 'https://www.thescore.com/nhl/news.rss', contentType: 'article', priority: 66 },
  { id: 'sporting-news', name: 'Sporting News', kind: 'sports-site', url: 'https://www.sportingnews.com', feedUrl: 'https://www.sportingnews.com/ca/nhl/rss', contentType: 'article', priority: 62 },
  { id: 'toronto-star', name: 'Toronto Star', kind: 'newspaper', url: 'https://www.thestar.com/sports/leafs.html', contentType: 'article', priority: 74 },
  { id: 'toronto-sun', name: 'Toronto Sun', kind: 'newspaper', url: 'https://torontosun.com/category/sports/hockey/nhl/toronto-maple-leafs', contentType: 'article', priority: 72 },
  { id: 'globe-and-mail', name: 'Globe and Mail', kind: 'newspaper', url: 'https://www.theglobeandmail.com/sports/hockey/', contentType: 'article', priority: 70 },
  { id: 'steve-dangle-podcast', name: 'Steve Dangle Podcast', kind: 'podcast', url: 'https://sdpn.ca/podcasts/steve-dangle-podcast/', feedUrl: 'https://feeds.megaphone.fm/steve-dangle-podcast', contentType: 'podcast', priority: 70 },
  { id: 'locked-on-leafs', name: 'Locked On Leafs', kind: 'podcast', url: 'https://lockedonpodcasts.com/podcasts/locked-on-maple-leafs/', contentType: 'podcast', priority: 62 },
  { id: 'sdpn-youtube', name: 'SDPN', kind: 'youtube', url: 'https://www.youtube.com/@sdpn/videos', contentType: 'video', priority: 66 },
  { id: 'leafs-digest-youtube', name: 'Leafs Digest', kind: 'youtube', url: 'https://www.youtube.com/@LeafsDigest/videos', contentType: 'video', priority: 58 },
  { id: 'sportsnet-590', name: 'Sportsnet 590', kind: 'radio', url: 'https://www.sportsnet.ca/590/', contentType: 'podcast', priority: 56 },
  { id: 'tsn-1050', name: 'TSN 1050', kind: 'radio', url: 'https://www.tsn.ca/radio/toronto-1050', contentType: 'podcast', priority: 56 },
  { id: 'tsn-video', name: 'TSN Video', kind: 'television', url: 'https://www.tsn.ca/video', contentType: 'video', priority: 60 },
  { id: 'sportsnet-video', name: 'Sportsnet Video', kind: 'television', url: 'https://www.sportsnet.ca/videos/', contentType: 'video', priority: 60 },
];

export function getSourceByName(name: string) {
  return AGGREGATOR_SOURCES.find((source) => source.name.toLowerCase() === name.toLowerCase());
}
