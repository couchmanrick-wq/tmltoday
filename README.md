# TML Today - Toronto Maple Leafs Aggregator

Your source for Toronto Maple Leafs news, videos, podcasts, and community discussion. An independent aggregator similar to PWHLdailybuzz.com.

## Features

- **Aggregated Content**: News articles, videos, and podcasts from multiple sources
- **Trending Players**: Track player mentions and rankings
- **League Standings**: Real-time standings and statistics
- **Team Information**: Detailed team and roster information
- **Division Tracking**: Monitor division rivals and standings
- **Community Forum**: Integration with external forums
- **Newsletter**: Daily digest of Leafs news
- **Responsive Design**: Works great on mobile, tablet, and desktop

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com) via OpenNext

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── content/          # Content aggregation API
│   ├── (site)/               # Main site routes
│   │   ├── page.tsx          # Home page
│   │   ├── videos/           # Videos section
│   │   ├── podcasts/         # Podcasts section
│   │   ├── columns/          # Analysis & blogs
│   │   ├── players/          # Player information
│   │   ├── teams/            # Team information
│   │   └── standings/        # League standings
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Header, Footer, Navigation
│   └── content/              # NewsCard, PlayerCard, etc.
├── data/
│   └── teams.ts              # Team and player data
├── lib/
│   └── feeds.ts              # Feed aggregation utilities
└── types/
    └── index.ts              # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The site will auto-reload as you make changes.

### Build

```bash
npm run build
npm start
```

### Preview on Cloudflare

Preview the app on the Cloudflare runtime:

```bash
npm run preview
```

## Configuration

### Environment Variables

Create a `.env.local` file with any API keys needed:

```env
# RSS Feed URLs and API keys (when implementing real feeds)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Customization

#### Teams & Roster
Edit [src/data/teams.ts](src/data/teams.ts) to update the Leafs roster and team information.

#### Content Sources
Update [src/lib/feeds.ts](src/lib/feeds.ts) to add RSS feeds and API integrations for:
- News articles
- YouTube videos
- Podcasts
- Forum threads

#### Styling
Customize colors and styles in [tailwind.config.ts](tailwind.config.ts) or update component classes.

## Content Integration

### Adding News Feeds

The project is ready to integrate with:
- **RSS Feeds**: Sports news websites (TSN, Sportsnet, The Hockey News)
- **YouTube API**: Official Leafs channel and related content
- **Podcast Platforms**: Apple Podcasts, Spotify, other podcast APIs
- **Twitter/X API**: Social media mentions
- **Forum API**: External community forum

See [src/lib/feeds.ts](src/lib/feeds.ts) for integration points.

## Deployment

### Cloudflare Workers

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Or upload a preview:

```bash
npm run upload
```

See [Cloudflare OpenNext Documentation](https://opennext.js.org/cloudflare) for more details.

## Features Roadmap

- [ ] RSS feed aggregation from multiple sources
- [ ] YouTube integration for video highlights
- [ ] Podcast feed aggregation
- [ ] Real-time game updates and scores
- [ ] User authentication for personalized content
- [ ] Newsletter subscription backend
- [ ] Forum integration (linking to external forum)
- [ ] Social media feed integration
- [ ] Mobile app (PWA)
- [ ] Dark mode toggle (already in components)
- [ ] Search functionality
- [ ] Advanced filtering and sorting

## API Routes

### GET /api/content
Fetch aggregated content with filtering.

**Query Parameters:**
- `type`: Filter by content type (article, video, podcast)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

**Example:**
```bash
GET /api/content?type=video&page=1&pageSize=10
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is independent and not affiliated with the Toronto Maple Leafs or the NHL.

## Support

For questions or issues, please open an issue on GitHub.

## Disclaimer

This is an independent news aggregator and is not affiliated with the Toronto Maple Leafs, the National Hockey League (NHL), or any of the content sources. All content is aggregated from publicly available sources.

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
