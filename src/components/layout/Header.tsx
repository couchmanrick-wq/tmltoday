'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* The wordmark is dark navy, so it needs a light plate in dark mode. */}
            <Image
              src="/images/tmltoday-logo.webp"
              alt="TMLtoday.com — Leafs News &amp; Views"
              width={263}
              height={80}
              priority
              className="h-10 w-auto dark:bg-white dark:rounded-md dark:px-2 dark:py-1"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/videos">Videos</NavLink>
            <NavLink href="/podcasts">Podcasts</NavLink>
            <NavLink href="/columns">Columns</NavLink>
            <NavLink href="/players">Players</NavLink>
            <NavLink href="/teams">Teams</NavLink>
            <NavLink href="/standings">Standings</NavLink>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Newsletter
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  );
}
