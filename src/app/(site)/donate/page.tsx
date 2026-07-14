import { DonateForm } from './donate-form';

export const metadata = {
  title: 'Support TML Today',
  description:
    'TML Today is independent, ad-light Maple Leafs coverage. Chip in once or become a monthly supporter.',
  alternates: { canonical: '/donate' },
};

const reasons = [
  {
    title: 'Servers & Data',
    text: 'Hosting, the stats and standings feeds, and the aggregator that pulls every Leafs story into one place.',
  },
  {
    title: 'Fewer Ads',
    text: 'Support means we can keep the site fast and readable instead of burying it under ad slots.',
  },
  {
    title: 'More Coverage',
    text: 'Time spent on columns, prospect tracking, and the Marlies — the stuff the big outlets skip.',
  },
];

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;

  return (
    <div className="space-y-12">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-400">
          Support the site
        </p>
        <h1 className="mb-2 text-4xl font-bold">Chip In</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          TML Today is run by a small crew of Leafs fans, not a media conglomerate. If the site is
          part of your morning routine and you want to help keep it going, this is the spot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {reasons.map((reason) => (
          <div key={reason.title} className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-2 font-heading text-lg font-bold text-blue-600">{reason.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{reason.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <DonateForm cancelled={cancelled === '1'} />
      </div>
    </div>
  );
}
