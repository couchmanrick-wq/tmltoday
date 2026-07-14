import Link from 'next/link';

interface PaginationProps {
  page: number;
  pageCount: number;
  basePath: string;
  /** Other query params on the page (a search term, a type filter) that must survive paging. */
  params?: Record<string, string>;
}

export function Pagination({ page, pageCount, basePath, params = {} }: PaginationProps) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams(params);
    if (target > 1) search.set('page', String(target));
    const query = search.toString();

    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-slate-300 pt-6">
      <PageLink href={href(page - 1)} disabled={page === 1} rel="prev">
        &larr; Newer
      </PageLink>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((entry, index) =>
          entry === 'gap' ? (
            <li key={`gap-${index}`} className="px-2 text-slate-500" aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={href(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={[
                  'flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-bold',
                  entry === page
                    ? 'bg-brand text-white'
                    : 'text-brand hover:bg-blue-100',
                ].join(' ')}
              >
                {entry}
              </Link>
            </li>
          )
        )}
      </ol>

      <p className="text-sm font-bold text-slate-500 sm:hidden">
        Page {page} of {pageCount}
      </p>

      <PageLink href={href(page + 1)} disabled={page === pageCount} rel="next">
        Older &rarr;
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  rel,
  children,
}: {
  href: string;
  disabled: boolean;
  rel: 'prev' | 'next';
  children: React.ReactNode;
}) {
  const className = 'rounded-md border border-slate-300 px-4 py-2 text-sm font-bold';

  // At either end there is nowhere to go, so render a non-interactive stub rather than a link that
  // would loop the reader back onto the page they are already on.
  if (disabled) {
    return <span className={`${className} cursor-default text-slate-400`}>{children}</span>;
  }

  return (
    <Link href={href} rel={rel} className={`${className} text-brand hover:bg-blue-100`}>
      {children}
    </Link>
  );
}

/** First page, last page, and a window around the current one — with gaps standing in for the rest. */
function pageWindow(page: number, pageCount: number): Array<number | 'gap'> {
  const pages = new Set<number>([1, pageCount, page]);

  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < pageCount) pages.add(page + 1);

  const ordered = [...pages].sort((a, b) => a - b);
  const entries: Array<number | 'gap'> = [];

  ordered.forEach((entry, index) => {
    if (index > 0 && entry - ordered[index - 1] > 1) entries.push('gap');
    entries.push(entry);
  });

  return entries;
}
