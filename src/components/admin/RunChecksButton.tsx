'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function RunChecksButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  const run = () => {
    setSpinning(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setSpinning(false), 400);
    });
  };

  const busy = isPending || spinning;
  return (
    <button
      onClick={run}
      disabled={busy}
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
    >
      {busy ? 'Running…' : 'Run checks'}
    </button>
  );
}
