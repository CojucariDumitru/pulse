import Stripe from 'stripe';
import { env } from './env';

/**
 * Stripe client. When STRIPE_SECRET_KEY is unset the app runs in
 * "demo checkout" mode: memberships activate directly (clearly labeled),
 * so the whole flow is demoable without live keys.
 */
export const stripe = env.stripe.secretKey
  ? new Stripe(env.stripe.secretKey, { apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion })
  : null;

export const stripeConfigured = Boolean(env.stripe.secretKey);

export const PLAN_PRICE_IDS: Record<string, string> = {
  ESSENTIAL: env.stripe.priceEssential,
  UNLIMITED: env.stripe.priceUnlimited,
  ANNUAL: env.stripe.priceAnnual,
};

export function planFromPriceId(priceId: string): 'ESSENTIAL' | 'UNLIMITED' | 'ANNUAL' | null {
  const entry = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id && id === priceId);
  return (entry?.[0] as 'ESSENTIAL' | 'UNLIMITED' | 'ANNUAL') ?? null;
}
