'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface FilterItem {
  href: string;
  label: string;
}

export const FILTER_ITEMS: FilterItem[] = [
  { href: '/news', label: 'News' },
  { href: '/videos', label: 'Videos' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/rumours', label: 'Rumours' },
  { href: '/marlies', label: 'Marlies' },
  { href: '/prospects', label: 'Prospects' },
];

// The eight filters do not fit across a phone, so below `lg` they collapse into a native select —
// which also gives us the platform's own picker, keyboard support and focus handling for free.
export function FilterNav({ items = FILTER_ITEMS }: { items?: FilterItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  // The home page is the unfiltered view, so no filter is selected there.
  const active = items.find((item) => routeOf(item.href) === pathname);

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="content-filter" className="sr-only">
        Filter content
      </label>
      <select
        id="content-filter"
        value={active?.href ?? ''}
        onChange={(event) => router.push(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand shadow-sm outline-none focus:border-blue-500 lg:hidden"
      >
        {!active && (
          <option value="" disabled>
            Browse
          </option>
        )}
        {items.map((item) => (
          <option key={item.href} value={item.href}>
            {item.label}
          </option>
        ))}
      </select>

      <nav aria-label="Content filters" className="hidden gap-7 lg:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item === active ? 'page' : undefined}
            className={[
              'shrink-0 border-b-2 pb-4 text-xs font-bold uppercase tracking-[0.12em]',
              item === active
                ? 'border-blue-600 text-brand'
                : 'border-transparent text-slate-500 hover:text-brand',
            ].join(' ')}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function routeOf(href: string) {
  return href.split('?')[0];
}
