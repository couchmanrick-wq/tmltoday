'use client';

import { FormEvent, useState } from 'react';

import {
  DonationInterval,
  MAX_DONATION_CENTS,
  MIN_DONATION_CENTS,
  PRESET_AMOUNTS_CENTS,
  formatAmount,
} from '@/lib/donations';

const intervals: { id: DonationInterval; label: string; hint: string }[] = [
  { id: 'one-time', label: 'One Time', hint: 'A single contribution, whenever you feel like it.' },
  { id: 'monthly', label: 'Monthly', hint: 'Steady support through the whole season. Cancel any time.' },
];

export function DonateForm({ cancelled = false }: { cancelled?: boolean }) {
  const [frequency, setFrequency] = useState<DonationInterval>('one-time');
  const [presetCents, setPresetCents] = useState<number | null>(PRESET_AMOUNTS_CENTS['one-time'][1]);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const presets = PRESET_AMOUNTS_CENTS[frequency];

  function chooseInterval(next: DonationInterval) {
    setFrequency(next);
    // Presets differ per interval, so land on that interval's second tier rather
    // than leaving a one-time amount selected on the monthly list.
    setPresetCents(PRESET_AMOUNTS_CENTS[next][1]);
    setCustomAmount('');
    setError('');
  }

  function choosePreset(cents: number) {
    setPresetCents(cents);
    setCustomAmount('');
    setError('');
  }

  function chooseCustom(value: string) {
    setCustomAmount(value);
    setPresetCents(null);
    setError('');
  }

  function resolveAmountCents() {
    if (presetCents !== null) return presetCents;
    const dollars = Number(customAmount);
    if (!Number.isFinite(dollars) || dollars <= 0) return null;
    return Math.round(dollars * 100);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountCents = resolveAmountCents();
    if (amountCents === null || amountCents < MIN_DONATION_CENTS || amountCents > MAX_DONATION_CENTS) {
      setError(
        `Please pick an amount between ${formatAmount(MIN_DONATION_CENTS)} and ${formatAmount(MAX_DONATION_CENTS)}.`
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          interval: frequency,
          supporterName: String(formData.get('supporterName') ?? '').trim(),
          note: String(formData.get('note') ?? '').trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; url?: string; error?: string }
        | null;

      if (!res.ok || !data?.ok || !data.url) {
        throw new Error(data?.error || 'Could not start checkout right now.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout right now.');
      setSubmitting(false);
    }
  }

  const amountCents = resolveAmountCents();
  const buttonAmount = amountCents ? ` ${formatAmount(amountCents)}` : '';
  const buttonSuffix = frequency === 'monthly' ? '/month' : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {cancelled && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          No worries — nothing was charged. Pick an amount below if you&apos;d like to try again.
        </p>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          How often?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {intervals.map((option) => {
            const active = frequency === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseInterval(option.id)}
                className={`rounded-lg border-2 p-4 text-left transition ${
                  active
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <span className="block font-heading text-lg font-bold text-blue-600">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm text-slate-600">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          How much?
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map((cents) => {
            const active = presetCents === cents;
            return (
              <button
                key={cents}
                type="button"
                aria-pressed={active}
                onClick={() => choosePreset(cents)}
                className={`rounded-lg border-2 py-4 text-xl font-bold transition ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-blue-600 hover:border-blue-400'
                }`}
              >
                {formatAmount(cents)}
                {frequency === 'monthly' && (
                  <span className="ml-0.5 text-xs font-semibold opacity-70">/mo</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Other amount <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <span aria-hidden="true" className="text-lg font-bold text-slate-400">
            $
          </span>
          <input
            name="customAmount"
            type="number"
            inputMode="decimal"
            min={MIN_DONATION_CENTS / 100}
            max={MAX_DONATION_CENTS / 100}
            step="1"
            placeholder="75"
            value={customAmount}
            onChange={(event) => chooseCustom(event.target.value)}
            className="w-full bg-transparent py-3 text-lg font-semibold text-slate-900 outline-none"
          />
          <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400">
            CAD{frequency === 'monthly' ? ' / month' : ''}
          </span>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Your name <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <input
          name="supporterName"
          type="text"
          autoComplete="name"
          placeholder="Wendel C."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Leave a note <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          name="note"
          maxLength={400}
          placeholder="Keep up the great coverage. Go Leafs Go."
          className="min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-4 font-heading text-lg font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? 'Opening checkout…' : `Continue to Checkout${buttonAmount}${buttonSuffix}`}
      </button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      <p className="text-center text-xs leading-relaxed text-slate-500">
        Payments are handled by Stripe — your card details never touch this site. Monthly support can
        be cancelled any time, just email us. TML Today is an independent site, not a registered
        charity, so contributions aren&apos;t tax deductible.
      </p>
    </form>
  );
}
