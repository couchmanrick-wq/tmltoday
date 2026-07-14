import Image from 'next/image';

export function SiteHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/images/front-page-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_42%] -z-10"
      />
      <div className="absolute inset-0 -z-10 bg-brand/65 md:bg-transparent md:bg-gradient-to-r md:from-brand/70 md:from-45% md:via-brand/30 md:via-62% md:to-transparent md:to-80%" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden opacity-50 md:block md:bg-[radial-gradient(ellipse_58%_85%_at_24%_50%,var(--brand)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
          <span aria-hidden="true" className="h-0.5 w-8 bg-white" />
          Your complete Maple Leafs coverage
        </p>
        {/* Not an <h1>: this banner repeats on every page, so each page keeps its own unique h1. */}
        <p className="text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
          <span className="block">Latest team news.</span>
          <span className="block text-blue-100">Up-to-the-minute.</span>
        </p>
      </div>
    </section>
  );
}
