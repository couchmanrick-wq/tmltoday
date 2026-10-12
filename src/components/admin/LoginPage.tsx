'use client';

import { useSearchParams } from 'next/navigation';

export function LoginPage() {
  const invalid = useSearchParams().get('error') === 'invalid';
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">TML Today</p>
        <h1 className="mt-1 text-3xl font-black text-brand">Admin login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to manage and monitor the aggregator.</p>
        {invalid && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Incorrect username or password.
          </p>
        )}
        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Username
            <input name="username" required autoComplete="username" className="mt-1 h-12 w-full rounded-md border border-slate-300 px-3 font-normal outline-none focus:ring-2 focus:ring-blue-300" />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="mt-1 h-12 w-full rounded-md border border-slate-300 px-3 font-normal outline-none focus:ring-2 focus:ring-blue-300" />
          </label>
          <button type="submit" className="h-12 w-full rounded-md bg-brand font-bold text-white hover:bg-blue-800">Sign in</button>
        </form>
      </section>
    </main>
  );
}
