// Shared donation rules. Imported by both the /donate UI and the API route so
// the presets shown to a supporter and the amounts the server will accept can
// never drift apart.

export type DonationInterval = 'one-time' | 'monthly';

/** Stripe's CAD minimum is $0.50; $2 keeps the 2.9% + $0.30 fee from eating the tip. */
export const MIN_DONATION_CENTS = 200;
export const MAX_DONATION_CENTS = 500_000;

export const PRESET_AMOUNTS_CENTS: Record<DonationInterval, number[]> = {
  'one-time': [1000, 2500, 5000, 10000],
  monthly: [500, 1000, 1500, 2000],
};

export function isDonationInterval(value: unknown): value is DonationInterval {
  return value === 'one-time' || value === 'monthly';
}

export function formatAmount(cents: number) {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/**
 * Turn whatever the client sent into a whole number of cents, or return null if
 * it is not a usable donation amount.
 */
export function parseAmountCents(value: unknown): number | null {
  const cents = Math.round(Number(value));
  if (!Number.isFinite(cents)) return null;
  if (cents < MIN_DONATION_CENTS || cents > MAX_DONATION_CENTS) return null;
  return cents;
}
