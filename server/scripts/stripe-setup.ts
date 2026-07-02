/**
 * One-off: creates the PULSE membership products + prices in Stripe (test mode)
 * and prints the env lines to paste into .env / Render.
 *
 * Run from server/ (needs STRIPE_SECRET_KEY in .env):
 *   npx tsx scripts/stripe-setup.ts
 */
import 'dotenv/config';
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('STRIPE_SECRET_KEY is not set in .env — add your sk_test_ key first.');
  process.exit(1);
}

const stripe = new Stripe(key);

const PLANS = [
  { plan: 'ESSENTIAL', name: 'PULSE Essential', amount: 4900, interval: 'month' as const },
  { plan: 'UNLIMITED', name: 'PULSE Unlimited', amount: 8900, interval: 'month' as const },
  { plan: 'ANNUAL', name: 'PULSE Annual', amount: 79000, interval: 'year' as const },
];

async function main() {
  console.log('Creating PULSE products & prices in Stripe (test mode)...\n');
  const lines: string[] = [];

  for (const p of PLANS) {
    const product = await stripe.products.create({
      name: p.name,
      metadata: { plan: p.plan },
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: 'usd',
      recurring: { interval: p.interval },
      metadata: { plan: p.plan },
    });
    console.log(`✓ ${p.name} — ${price.id}`);
    lines.push(`STRIPE_PRICE_${p.plan}=${price.id}`);
  }

  console.log('\nAdd these to server/.env and the Render dashboard:\n');
  console.log(lines.join('\n'));
  console.log(
    '\nAlso set STRIPE_WEBHOOK_SECRET after creating a webhook endpoint for\n' +
      '<api-url>/api/memberships/webhook (events: checkout.session.completed,\n' +
      'customer.subscription.updated, customer.subscription.deleted).',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
