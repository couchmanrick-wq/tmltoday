'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">TML</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">TML Today</span>
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
