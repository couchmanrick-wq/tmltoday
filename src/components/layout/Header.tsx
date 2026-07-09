'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FORUM_URL } from '@/lib/site';

type NavItem = {
  href: string;
  label: string;
  /** Opens in a new tab; never marked as the active route. */
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/videos', label: 'Videos' },
  { href: FORUM_URL, label: 'Forums', external: true },
  { href: '/teams', label: 'Team' },
  // Anchors the newsletter signup on the homepage, so it works from any route.
  { href: '/#newsletter', label: 'Newsletter' },
];

const isActive = (item: NavItem, pathname: string) =>
  !item.external && !item.href.includes('#') && item.href === pathname;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigating to the current route leaves the panel open otherwise.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* The wordmark is dark navy, so it needs a light plate in dark mode. */}
            <Image
              src="/images/tml-logo.webp"
              alt="TMLtoday.com — Leafs News &amp; Views"
              width={412}
              height={160}
              priority
              className="h-12 sm:h-20 w-auto dark:bg-white dark:rounded-md dark:px-2 dark:py-1"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item, pathname)} />
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close main menu' : 'Open main menu'}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item, pathname)}
                onNavigate={() => setMenuOpen(false)}
                block
              />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  item,
  active,
  block,
  onNavigate,
}: {
  item: NavItem;
  active?: boolean;
  block?: boolean;
  onNavigate?: () => void;
}) {
  // Menu type: Roboto 700 15px, brand navy. Roboto is the body font, so
  // font-sans covers it. The bottom border is always present but transparent
  // when inactive, so the highlight cannot shift the layout.
  // Both states must name a border-color; listing `border-transparent` in the
  // shared part would beat `border-sky-400` on stylesheet order, not class order.
  const className = [
    block ? 'block px-3 py-3' : 'px-3 py-2',
    'font-sans text-[15px] font-bold text-brand',
    'border-b-2 transition-colors',
    active ? 'border-sky-400' : 'border-transparent hover:border-sky-200',
  ].join(' ');

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={className}
    >
      {item.label}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
