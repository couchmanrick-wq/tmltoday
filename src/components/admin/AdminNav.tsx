'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/columns', label: 'Columns' },
  { href: '/admin/sources', label: 'Sources' },
  { href: '/admin/content', label: 'Last 50 items' },
  { href: '/admin/ai-crawl', label: 'AI Crawl' },
  { href: '/admin/health', label: 'Health' },
  { href: '/admin/account', label: 'Account' },
  { href: '/admin/contributors', label: 'Contributors' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex min-h-[50px] items-center gap-1 overflow-x-auto px-5">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-md px-[17px] py-2 text-xs font-bold transition ${active ? 'bg-blue-50 text-[#001b59]' : 'text-[#001b59] hover:bg-blue-50 hover:text-[#5b32ee]'}`}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link href="/" className="whitespace-nowrap px-[17px] py-4 text-xs font-bold text-[#001b59] hover:text-[#5b32ee]">
        View live website
      </Link>
    </nav>
  );
}
