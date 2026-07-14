'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FORUM_URL } from '@/lib/site';

const COVERAGE = [
  { href: '/news', label: 'News' },
  { href: '/videos', label: 'Videos' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/columns', label: 'Columns' },
];

const AROUND = [
  { href: '/rumours', label: 'Rumours' },
  { href: '/marlies', label: 'Marlies' },
  { href: '/prospects', label: 'Prospects' },
  { href: '/team', label: 'Team' },
  { href: '/players', label: 'Players' },
  { href: '/standings', label: 'Standings' },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex flex-col items-center leading-none">
              <Image src="/images/tmltoday-round-logo.webp" alt="TMLtoday.com - Leafs News & Views" width={120} height={120} className="rounded-full" />
              <span className="mt-3 text-2xl font-black tracking-tight text-white">TMLtoday.com</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white">Leafs News &amp; Views</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white">
              Independent coverage of the Toronto Maple Leafs — news, videos, podcasts, rumours and prospects, aggregated in one place.
            </p>
          </div>

          <FooterColumn title="Coverage" links={COVERAGE} />
          <FooterColumn title="Around the Leafs" links={AROUND} />

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Connect</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#newsletter" className="text-white underline underline-offset-2 hover:opacity-80">Newsletter</a></li>
              <li><FooterExternal href={FORUM_URL}>Forum</FooterExternal></li>
              <li><FooterExternal href="https://twitter.com">X / Twitter</FooterExternal></li>
              <li><FooterExternal href="https://instagram.com">Instagram</FooterExternal></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TML Today. Not affiliated with the Toronto Maple Leafs or the NHL.</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-white underline underline-offset-2 hover:opacity-80">About</Link>
            <a href="#privacy" className="text-white underline underline-offset-2 hover:opacity-80">Privacy</a>
            <a href="#terms" className="text-white underline underline-offset-2 hover:opacity-80">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white underline underline-offset-2 hover:opacity-80">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterExternal({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  );
}
