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
  leafsFocused?: boolean;
  rumourFocused?: boolean;
}

export const AGGREGATOR_SOURCES: AggregatorSource[] = [
  // Official and major hockey news
  { id: 'nhl-leafs', name: 'Toronto Maple Leafs', kind: 'official', url: 'https://www.nhl.com/mapleleafs/news', contentType: 'article', priority: 100, leafsFocused: true },
  { id: 'nhl', name: 'NHL.com', kind: 'official', url: 'https://www.nhl.com/news', contentType: 'article', priority: 90 },
  { id: 'the-hockey-news', name: 'The Hockey News', kind: 'hockey-site', url: 'https://thehockeynews.com', feedUrl: 'https://thehockeynews.com/rss/THNHOME/full/', contentType: 'article', priority: 82 },
  { id: 'daily-faceoff', name: 'Daily Faceoff', kind: 'hockey-site', url: 'https://www.dailyfaceoff.com', contentType: 'article', priority: 78 },
  { id: 'the-hockey-writers', name: 'The Hockey Writers', kind: 'hockey-site', url: 'https://thehockeywriters.com/category/toronto-maple-leafs/', feedUrl: 'https://thehockeywriters.com/category/toronto-maple-leafs/feed/', contentType: 'article', priority: 74, leafsFocused: true },
  { id: 'sportsnet', name: 'Sportsnet', kind: 'sports-media', url: 'https://www.sportsnet.ca', feedUrl: 'https://www.sportsnet.ca/feed/', contentType: 'article', priority: 82 },
  { id: 'cbc-nhl', name: 'CBC Sports NHL', kind: 'sports-media', url: 'https://www.cbc.ca/sports/hockey/nhl', feedUrl: 'https://news.google.com/rss/search?q=site%3Acbc.ca%2Fsports%2Fhockey%2Fnhl%20%22Maple%20Leafs%22&hl=en-CA&gl=CA&ceid=CA%3Aen', contentType: 'article', priority: 78 },
  { id: 'espn-nhl', name: 'ESPN NHL', kind: 'sports-media', url: 'https://www.espn.com/nhl/', feedUrl: 'https://www.espn.com/espn/rss/nhl/news', contentType: 'article', priority: 72 },
  { id: 'thescore-nhl', name: 'theScore', kind: 'sports-media', url: 'https://www.thescore.com/nhl/news', feedUrl: 'https://news.google.com/rss/search?q=site%3Athescore.com%20%22Maple%20Leafs%22&hl=en-CA&gl=CA&ceid=CA%3Aen', contentType: 'article', priority: 70, leafsFocused: true },
  { id: 'bbc-ice-hockey', name: 'BBC Ice Hockey', kind: 'sports-media', url: 'https://www.bbc.com/sport/ice-hockey', feedUrl: 'https://feeds.bbci.co.uk/sport/ice-hockey/rss.xml', contentType: 'article', priority: 58 },
  { id: 'pro-hockey-rumors', name: 'Pro Hockey Rumors', kind: 'hockey-site', url: 'https://www.prohockeyrumors.com', feedUrl: 'https://www.prohockeyrumors.com/feed', contentType: 'article', priority: 68, rumourFocused: true },
  { id: 'nhl-trade-rumors', name: 'NHL Trade Rumors', kind: 'hockey-site', url: 'https://www.nhltraderumors.me', feedUrl: 'https://www.nhltraderumors.me/feeds/posts/default?alt=rss', contentType: 'blog', priority: 55, rumourFocused: true },
  { id: 'nhl-rumors', name: 'NHL Rumors', kind: 'hockey-site', url: 'https://nhlrumors.com', feedUrl: 'https://nhlrumors.com/feed/', contentType: 'article', priority: 62, rumourFocused: true },
  { id: 'spectors-hockey', name: "Spector's Hockey", kind: 'hockey-site', url: 'https://www.spectorshockey.net', feedUrl: 'https://www.spectorshockey.net/feed/', contentType: 'blog', priority: 66, rumourFocused: true },
  { id: 'nhl-trade-talk', name: 'NHL Trade Talk', kind: 'hockey-site', url: 'https://nhltradetalk.com', feedUrl: 'https://nhltradetalk.com/feed/', contentType: 'article', priority: 58, rumourFocused: true },
  { id: 'puck-prose', name: 'Puck Prose', kind: 'hockey-site', url: 'https://puckprose.com', feedUrl: 'https://puckprose.com/feed', contentType: 'blog', priority: 58 },
  { id: 'a-winning-habit', name: 'A Winning Habit', kind: 'hockey-site', url: 'https://awinninghabit.com', feedUrl: 'https://awinninghabit.com/feed/', contentType: 'blog', priority: 52 },

  // Leafs publications and blogs
  { id: 'maple-leafs-hot-stove', name: 'Maple Leafs Hot Stove', kind: 'leafs-blog', url: 'https://mapleleafshotstove.com', feedUrl: 'https://mapleleafshotstove.com/feed/', contentType: 'blog', priority: 76, leafsFocused: true },
  { id: 'the-leafs-nation', name: 'The Leafs Nation', kind: 'leafs-blog', url: 'https://theleafsnation.com', contentType: 'blog', priority: 72, leafsFocused: true },
  { id: 'pension-plan-puppets', name: 'Pension Plan Puppets', kind: 'leafs-blog', url: 'https://www.pensionplanpuppets.com', feedUrl: 'https://www.pensionplanpuppets.com/rss/', contentType: 'blog', priority: 68, leafsFocused: true },
  { id: 'editor-in-leaf', name: 'Editor In Leaf', kind: 'leafs-blog', url: 'https://editorinleaf.com', feedUrl: 'https://editorinleaf.com/feed/', contentType: 'blog', priority: 64, leafsFocused: true },
  { id: 'global-news-leafs', name: 'Global News Maple Leafs', kind: 'sports-media', url: 'https://globalnews.ca/tag/toronto-maple-leafs/', feedUrl: 'https://globalnews.ca/tag/toronto-maple-leafs/feed/', contentType: 'article', priority: 72, leafsFocused: true },
  { id: 'toronto-sun', name: 'Toronto Sun', kind: 'newspaper', url: 'https://torontosun.com/category/sports/hockey/nhl/toronto-maple-leafs', feedUrl: 'https://torontosun.com/category/sports/hockey/nhl/toronto-maple-leafs/feed.xml', contentType: 'article', priority: 72, leafsFocused: true },
  { id: 'last-word-leafs', name: 'Last Word on Hockey', kind: 'hockey-site', url: 'https://lastwordonsports.com/hockey/category/nhl-teams/toronto-maple-leafs/', feedUrl: 'https://lastwordonsports.com/hockey/category/nhl-teams/toronto-maple-leafs/feed/', contentType: 'blog', priority: 64, leafsFocused: true },
  { id: 'yardbarker-leafs', name: 'Yardbarker Maple Leafs', kind: 'sports-site', url: 'https://www.yardbarker.com/nhl/teams/toronto_maple_leafs/124', feedUrl: 'https://www.yardbarker.com/rss/team/24', contentType: 'article', priority: 58, leafsFocused: true },
  { id: 'hockey-hotstove', name: 'Hockey Hotstove', kind: 'leafs-blog', url: 'https://hockeyhotstove.com', feedUrl: 'https://hockeyhotstove.com/feed/', contentType: 'blog', priority: 64 },
  { id: 'streets-of-toronto', name: 'Streets of Toronto', kind: 'newspaper', url: 'https://streetsoftoronto.com/?s=maple+leafs', feedUrl: 'https://streetsoftoronto.com/?s=maple%20leafs&feed=rss2', contentType: 'article', priority: 60, leafsFocused: true },
  { id: '6ix-on-ice', name: '6ix On Ice', kind: 'leafs-blog', url: 'https://6ixonice.com', feedUrl: 'https://6ixonice.com/feed/', contentType: 'blog', priority: 64, leafsFocused: true },
  { id: 'hockey-patrol', name: 'Hockey Patrol', kind: 'leafs-blog', url: 'https://www.hockeypatrol.com', feedUrl: 'https://www.hockeypatrol.com/rss.rss', contentType: 'blog', priority: 54, leafsFocused: true },
  { id: 'toronto-hockey-daily', name: 'Toronto Hockey Daily', kind: 'leafs-blog', url: 'https://www.torontohockeydaily.com', feedUrl: 'https://www.torontohockeydaily.com/rss.rss', contentType: 'blog', priority: 56, leafsFocused: true },
  { id: 'sportsblogs-leafs', name: 'Sportsblogs Maple Leafs', kind: 'sports-site', url: 'https://sportsblogs.org/nhl/maple-leafs', feedUrl: 'https://sportsblogs.org/nhl/maple-leafs.rss', contentType: 'blog', priority: 50, leafsFocused: true },
  { id: 'boston-hockey-now-leafs', name: 'Boston Hockey Now', kind: 'hockey-site', url: 'https://bostonhockeynow.com/tag/toronto-maple-leafs/', feedUrl: 'https://bostonhockeynow.com/tag/toronto-maple-leafs/feed/', contentType: 'article', priority: 58, leafsFocused: true },
  { id: 'the-road-leafs', name: 'The Road', kind: 'leafs-blog', url: 'https://www.theroad.biz', feedUrl: 'https://www.theroad.biz/feed', contentType: 'blog', priority: 72, leafsFocused: true },
  { id: 'inside-the-rink', name: 'Inside the Rink', kind: 'hockey-site', url: 'https://insidetherink.com', feedUrl: 'https://insidetherink.com/feed/', contentType: 'article', priority: 62 },
  { id: 'hockey-buzz', name: 'HockeyBuzz', kind: 'hockey-site', url: 'https://www.hockeybuzz.com', feedUrl: 'https://www.hockeybuzz.com/rss/', contentType: 'blog', priority: 52 },
  { id: 'heavy-leafs', name: 'Heavy Maple Leafs', kind: 'sports-site', url: 'https://heavy.com/sports/nhl/toronto-maple-leafs/', feedUrl: 'https://heavy.com/sports/nhl/toronto-maple-leafs/feed/', contentType: 'article', priority: 54, leafsFocused: true },
  { id: 'between-the-posts', name: 'Between The Posts', kind: 'leafs-blog', url: 'https://betweentheposts.ca', feedUrl: 'https://betweentheposts.ca/feed/', contentType: 'blog', priority: 62, leafsFocused: true },
  { id: 'tml-domain', name: 'TML Domain', kind: 'leafs-blog', url: 'https://tmldomain.com', feedUrl: 'https://tmldomain.com/feed/', contentType: 'blog', priority: 56, leafsFocused: true },
  { id: 'centre-of-leafs-nation', name: 'Centre of Leafs Nation', kind: 'leafs-blog', url: 'https://centreofleafsnation.wordpress.com', feedUrl: 'https://centreofleafsnation.wordpress.com/feed/', contentType: 'blog', priority: 48, leafsFocused: true },

  // Scrape-only publications without a stable public feed
  { id: 'tsn', name: 'TSN', kind: 'sports-media', url: 'https://www.tsn.ca/nhl/team-page/toronto-maple-leafs/5', contentType: 'article', priority: 82, leafsFocused: true },
  { id: 'the-score', name: 'theScore', kind: 'sports-site', url: 'https://www.thescore.com/nhl/teams/5', contentType: 'article', priority: 66, leafsFocused: true },
  { id: 'sporting-news', name: 'Sporting News', kind: 'sports-site', url: 'https://www.sportingnews.com/ca/nhl', contentType: 'article', priority: 62 },
  { id: 'toronto-star', name: 'Toronto Star', kind: 'newspaper', url: 'https://www.thestar.com/sports/leafs.html', contentType: 'article', priority: 74, leafsFocused: true },
  { id: 'globe-and-mail', name: 'Globe and Mail', kind: 'newspaper', url: 'https://www.theglobeandmail.com/sports/hockey/', contentType: 'article', priority: 70 },
  { id: 'the-athletic', name: 'The Athletic', kind: 'sports-media', url: 'https://www.nytimes.com/athletic/nhl/team/leafs/', contentType: 'article', priority: 80, leafsFocused: true },
  { id: 'yahoo-sports', name: 'Yahoo Sports', kind: 'sports-media', url: 'https://sports.yahoo.com/nhl/teams/toronto/', contentType: 'article', priority: 64, leafsFocused: true },
  { id: 'ap-nhl', name: 'Associated Press NHL', kind: 'sports-media', url: 'https://apnews.com/hub/nhl', contentType: 'article', priority: 76 },
  { id: 'blogto', name: 'blogTO', kind: 'newspaper', url: 'https://www.blogto.com/sports_play/', contentType: 'article', priority: 58 },
  { id: 'professors-press-box', name: "Professors' Press Box", kind: 'hockey-site', url: 'https://www.professorspressbox.com', contentType: 'blog', priority: 60 },
  { id: 'hockeyfeed', name: 'HockeyFeed', kind: 'hockey-site', url: 'https://www.hockeyfeed.com/nhl-news', contentType: 'article', priority: 54 },
  { id: 'the-fourth-period', name: 'The Fourth Period', kind: 'hockey-site', url: 'https://www.thefourthperiod.com/rumours', contentType: 'article', priority: 76, rumourFocused: true },

  // Podcasts and radio shows
  { id: 'steve-dangle-podcast', name: 'The Steve Dangle Podcast', kind: 'podcast', url: 'https://sdpn.ca/podcasts/steve-dangle-podcast/', feedUrl: 'https://feeds.megaphone.fm/TAMC3571499623', contentType: 'podcast', priority: 74, leafsFocused: true },
  { id: 'locked-on-leafs', name: 'Locked On Leafs', kind: 'podcast', url: 'https://lockedonpodcasts.com/podcasts/locked-on-maple-leafs/', feedUrl: 'https://rss.pdrl.fm/94872b/feeds.simplecast.com/_jae2YzM', contentType: 'podcast', priority: 68, leafsFocused: true },
  { id: 'leafs-morning-take', name: 'Leafs Morning Take', kind: 'podcast', url: 'https://theleafsnation.com', feedUrl: 'https://feeds.acast.com/public/shows/633dd1a7c875840012363e24', contentType: 'podcast', priority: 68, leafsFocused: true },
  { id: 'the-leaf-report', name: 'The Leaf Report', kind: 'podcast', url: 'https://www.nytimes.com/athletic/podcast/148-the-leaf-report/', feedUrl: 'https://feeds.acast.com/public/shows/6818a394f30c20bff73527a1', contentType: 'podcast', priority: 72, leafsFocused: true },
  { id: 'real-kyper-bourne', name: 'Real Kyper & Bourne', kind: 'podcast', url: 'https://www.sportsnet.ca/590/real-kyper-and-bourne/', feedUrl: 'https://feeds.simplecast.com/4jXBOWgY', contentType: 'podcast', priority: 70, leafsFocused: true },
  { id: 'leafs-talk', name: 'Leafs Talk', kind: 'podcast', url: 'https://www.sportsnet.ca/podcasts/leafs-talk/', feedUrl: 'https://feeds.simplecast.com/RdObu2aS', contentType: 'podcast', priority: 66, leafsFocused: true },
  { id: 'overdrive', name: 'OverDrive', kind: 'radio', url: 'https://www.tsn.ca/radio/toronto-1050/overdrive', feedUrl: 'https://www.omnycontent.com/d/playlist/4809bc8a-e41a-405c-93da-a8cf011df2f4/0a0a57aa-0de9-46be-928b-aa1b013cb0dd/dc7170e7-d575-4beb-a090-aa1b013cb0eb/podcast.rss', contentType: 'podcast', priority: 68 },
  { id: 'first-up', name: 'First Up', kind: 'radio', url: 'https://www.tsn.ca/radio/toronto-1050/first-up', feedUrl: 'https://www.omnycontent.com/d/playlist/4809bc8a-e41a-405c-93da-a8cf011df2f4/f524f121-0ef7-413a-8ffd-afbd010cd871/f6cbae43-9125-4bb2-9d05-afbd012b80fd/podcast.rss', contentType: 'podcast', priority: 62 },
  { id: 'leafs-guy-tsn', name: 'Leafs Guy on TSN 1050', kind: 'radio', url: 'https://www.tsn.ca/radio/toronto-1050', feedUrl: 'https://www.omnycontent.com/d/playlist/4809bc8a-e41a-405c-93da-a8cf011df2f4/01aa5789-a6a7-41d9-b5ef-afb801564184/c961df6a-4bbf-484b-82be-afb80157b57b/podcast.rss', contentType: 'podcast', priority: 60, leafsFocused: true },
  { id: 'leafs-games', name: 'Toronto Maple Leafs Games', kind: 'radio', url: 'https://www.tsn.ca/radio/toronto-1050', feedUrl: 'https://post.futurimedia.com/chumam/playlist/rss/46.xml', contentType: 'podcast', priority: 66, leafsFocused: true },
  { id: 'buds-all-day', name: 'Buds All Day', kind: 'podcast', url: 'https://podcasts.apple.com/ca/podcast/id1559964445', feedUrl: 'https://anchor.fm/s/53fbd5d0/podcast/rss', contentType: 'podcast', priority: 56, leafsFocused: true },
  { id: 'gluttons-for-punishment', name: 'Gluttons For Punishment', kind: 'podcast', url: 'https://podcasts.apple.com/ca/podcast/id1548334790', feedUrl: 'https://anchor.fm/s/46894748/podcast/rss', contentType: 'podcast', priority: 56, leafsFocused: true },
  { id: 'the-leafscast', name: 'The LeafsCast', kind: 'podcast', url: 'https://podcasts.apple.com/ca/podcast/id1813530226', feedUrl: 'https://feeds.redcircle.com/4c08982a-5da5-40c2-8c5c-9f5deb0e9224', contentType: 'podcast', priority: 58, leafsFocused: true },
  { id: 'original-6ix', name: 'Original 6ix', kind: 'podcast', url: 'https://podcastaddict.com/podcast/original-6ix/5444809', contentType: 'podcast', priority: 54, leafsFocused: true },
  { id: 'chris-johnston-show', name: 'The Chris Johnston Show', kind: 'podcast', url: 'https://sdpn.ca', feedUrl: 'https://feeds.megaphone.fm/TAMC7226946837', contentType: 'podcast', priority: 66 },
  { id: '32-thoughts', name: '32 Thoughts', kind: 'podcast', url: 'https://www.sportsnet.ca/podcasts/32-thoughts/', feedUrl: 'https://feeds.simplecast.com/fYqFr5h_', contentType: 'podcast', priority: 74 },

  // YouTube Atom feeds (no API key required)
  { id: 'leafs-youtube', name: 'Toronto Maple Leafs YouTube', kind: 'youtube', url: 'https://www.youtube.com/@torontomapleleafs/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMrpTL3zZyNA5S1p9B3FhWg', contentType: 'video', priority: 86, leafsFocused: true },
  { id: 'sdpn-youtube', name: 'SDPN', kind: 'youtube', url: 'https://www.youtube.com/@sdpn/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0a0z05HiddEn7k6OGnDprg', contentType: 'video', priority: 66 },
  { id: 'leafs-digest-youtube', name: 'Leafs Digest', kind: 'youtube', url: 'https://www.youtube.com/@LeafsDigest/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_EUKCfhWZLk0dX4XxQaZIA', contentType: 'video', priority: 58, leafsFocused: true },
  { id: 'locked-on-leafs-youtube', name: 'Locked On Leafs YouTube', kind: 'youtube', url: 'https://www.youtube.com/@LockedOnLeafs/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC704dOotkV_QlFw_KXzmVzw', contentType: 'video', priority: 62, leafsFocused: true },
  { id: 'leafs-nation-youtube', name: 'The Leafs Nation YouTube', kind: 'youtube', url: 'https://www.youtube.com/@theleafsnation/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCz2aGunJjnIY0_u5AjVXrWA', contentType: 'video', priority: 60, leafsFocused: true },
  { id: 'sportsnet-youtube', name: 'Sportsnet YouTube', kind: 'youtube', url: 'https://www.youtube.com/@Sportsnet/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCVhibwHk4WKw4leUt6JfRLg', contentType: 'video', priority: 72 },
  { id: 'tsn-youtube', name: 'TSN YouTube', kind: 'youtube', url: 'https://www.youtube.com/@TSN_Sports/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC--i2rV5NCxiEIPefr3l-zQ', contentType: 'video', priority: 72 },
  { id: 'hnic-youtube', name: 'Hockey Night in Canada', kind: 'youtube', url: 'https://www.youtube.com/@HockeyNightInCanada/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwm2jx_f8Ya6m6VKd5zuSww', contentType: 'video', priority: 70 },
  { id: 'nhl-youtube', name: 'NHL YouTube', kind: 'youtube', url: 'https://www.youtube.com/@NHL/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqFMzb-4AUf6WAIbl132QKA', contentType: 'video', priority: 74 },
  { id: 'hockey-news-youtube', name: 'The Hockey News YouTube', kind: 'youtube', url: 'https://www.youtube.com/@TheHockeyNews/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCTSsWKqTXwOK9THxs1pq4PQ', contentType: 'video', priority: 64 },
  { id: 'hockey-writers-youtube', name: 'The Hockey Writers YouTube', kind: 'youtube', url: 'https://www.youtube.com/@TheHockeyWriters/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0KjPetmTefVxa4Al7eJTPg', contentType: 'video', priority: 60 },
  { id: 'hockey-guy-youtube', name: 'The Hockey Guy', kind: 'youtube', url: 'https://www.youtube.com/@TheHockeyGuy/videos', feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_AFyA9FqrZ57bb9QRH77wg', contentType: 'video', priority: 58 },
];

export function getSourceByName(name: string) {
  return AGGREGATOR_SOURCES.find((source) => source.name.toLowerCase() === name.toLowerCase());
}
