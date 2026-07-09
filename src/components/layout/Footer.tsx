'use client';

import Link from 'next/link';
import { FORUM_URL } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">TML Today</h3>
            <p className="text-sm text-slate-400">
              Independent coverage of the Toronto Maple Leafs. News, videos, podcasts, and more.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="hover:text-white transition-colors">
                  Podcasts
                </Link>
              </li>
              <li>
                <Link href="/columns" className="hover:text-white transition-colors">
                  Columns
                </Link>
              </li>
            </ul>
          </div>

          {/* Teams */}
          <div>
            <h4 className="font-semibold mb-4">Content</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/players" className="hover:text-white transition-colors">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-white transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/standings" className="hover:text-white transition-colors">
                  Standings
                </Link>
              </li>
              <li>
                <a
                  href={FORUM_URL}
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forum
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#newsletter" className="hover:text-white transition-colors">
                  Newsletter
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2024 TML Today. Not affiliated with the Toronto Maple Leafs or NHL.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
