export function NewsletterCard() {
  return (
    <section id="newsletter" className="scroll-mt-28 overflow-hidden rounded-xl bg-gradient-to-br from-brand to-blue-700 p-5 text-white shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">Free daily newsletter</p>
      <p className="mt-1 text-base font-bold leading-snug">Leafs news in your inbox by 7 AM.</p>
      <form className="mt-3 space-y-2">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@email.com"
          className="h-10 w-full rounded-md border border-white/20 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button type="submit" className="h-10 w-full rounded-md bg-amber-400 text-sm font-black text-brand transition hover:bg-amber-300">
          Get the 7 AM recap
        </button>
      </form>
      <p className="mt-2 text-[11px] text-blue-100">Free · unsubscribe anytime.</p>
    </section>
  );
}
