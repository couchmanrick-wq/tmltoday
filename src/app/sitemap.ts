import type { MetadataRoute } from 'next';

const SITE_URL = 'https://tmltoday.couchmanrick.workers.dev';

const PATHS = ['', '/news', '/videos', '/podcasts', '/blogs', '/rumours', '/marlies', '/prospects', '/columns', '/standings', '/team', '/players'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.7,
  }));
}
