import { CountPill, EmptyState, PageHeader, Stat, formatAdminDate } from '@/components/admin/ui';
import { formatAmount } from '@/lib/donations';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { MonthlyDonor, OneTimeDonor, listMonthlyDonors, listOneTimeDonors } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function DonorsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; edit?: string }>;
}) {
  const { notice, edit } = await searchParams;

  const { env } = getCloudflareContext();
  const stripeEnv = env as unknown as Record<string, unknown>;

  // Stripe is the only store of donations. If it is unreachable or unconfigured
  // we surface that plainly rather than rendering an empty table, which would
  // read as "no donors" and be indistinguishable from a real outage.
  let monthly: MonthlyDonor[] = [];
  let oneTime: OneTimeDonor[] = [];
  let loadError = '';

  try {
    [monthly, oneTime] = await Promise.all([listMonthlyDonors(stripeEnv), listOneTimeDonors(stripeEnv)]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Could not reach Stripe.';
  }

  const monthlyTotal = monthly.reduce((sum, donor) => sum + donor.amountCents, 0);
  const oneTimeTotal = oneTime
    .filter((donor) => !donor.refunded)
    .reduce((sum, donor) => sum + donor.amountCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supporters"
        title="Donors"
        description="Live from Stripe. Cancelling or refunding here changes the real subscription or payment — it is not just a row on this screen."
        meta={<CountPill>{monthly.length + oneTime.length} donations</CountPill>}
      />

      {notice && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
            notice.startsWith('Failed')
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {notice}
        </p>
      )}

      {loadError ? (
        <EmptyState>
          Could not load donors from Stripe: {loadError}
          {loadError.includes('STRIPE_SECRET_KEY') &&
            ' Set it with: npx wrangler secret put STRIPE_SECRET_KEY'}
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Monthly recurring" value={formatAmount(monthlyTotal)} />
            <Stat label="One-time (lifetime, net of refunds)" value={formatAmount(oneTimeTotal)} />
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-brand">
              Monthly supporters <span className="text-slate-400">({monthly.length})</span>
            </h3>

            {monthly.length === 0 ? (
              <EmptyState>No active monthly supporters yet.</EmptyState>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">Donor</th>
                        <th className="px-5 py-3">Date added</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthly.map((donor) => (
                        <MonthlyRow key={donor.id} donor={donor} editing={edit === donor.id} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-brand">
              One-time donations <span className="text-slate-400">({oneTime.length})</span>
            </h3>

            {oneTime.length === 0 ? (
              <EmptyState>No one-time donations yet.</EmptyState>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">Donor</th>
                        <th className="px-5 py-3">Date added</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {oneTime.map((donor) => (
                        <tr key={donor.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3">
                            <span className="font-bold text-brand">{donor.name}</span>
                            {donor.email && (
                              <span className="ml-2 text-xs text-slate-500">{donor.email}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
                            {formatAdminDate(donor.createdIso)}
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                            {formatAmount(donor.amountCents)}
                            {donor.refunded && (
                              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-500">
                                Refunded
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {donor.refunded ? (
                              <span className="text-xs text-slate-400">No actions</span>
                            ) : (
                              <form action="/api/admin/donors" method="post" className="inline">
                                <input type="hidden" name="intent" value="refund" />
                                <input type="hidden" name="id" value={donor.paymentIntentId} />
                                <button
                                  type="submit"
                                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50"
                                >
                                  Refund
                                </button>
                              </form>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MonthlyRow({ donor, editing }: { donor: MonthlyDonor; editing: boolean }) {
  if (editing) {
    return (
      <tr className="bg-blue-50/40">
        <td className="px-5 py-3 font-bold text-brand">{donor.name}</td>
        <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
          {formatAdminDate(donor.createdIso)}
        </td>
        <td className="px-5 py-3" colSpan={2}>
          <form action="/api/admin/donors" method="post" className="flex flex-wrap items-center justify-end gap-2">
            <input type="hidden" name="intent" value="update-amount" />
            <input type="hidden" name="id" value={donor.id} />
            <label className="flex items-center gap-1 text-sm font-semibold text-slate-700">
              $
              <input
                name="amount"
                type="number"
                min="2"
                max="5000"
                step="1"
                required
                defaultValue={donor.amountCents / 100}
                className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-xs text-slate-500">/ month</span>
            </label>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
            >
              Save
            </button>
            <a
              href="/admin/donors"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </a>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-5 py-3">
        <span className="font-bold text-brand">{donor.name}</span>
        {donor.email && <span className="ml-2 text-xs text-slate-500">{donor.email}</span>}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
        {formatAdminDate(donor.createdIso)}
      </td>
      <td className="px-5 py-3 text-sm font-semibold text-slate-700">
        {formatAmount(donor.amountCents)}
        <span className="text-xs font-normal text-slate-400"> / month</span>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="inline-flex gap-2">
          <a
            href={`/admin/donors?edit=${encodeURIComponent(donor.id)}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </a>
          <form action="/api/admin/donors" method="post" className="inline">
            <input type="hidden" name="intent" value="cancel" />
            <input type="hidden" name="id" value={donor.id} />
            <button
              type="submit"
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50"
            >
              Cancel support
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
