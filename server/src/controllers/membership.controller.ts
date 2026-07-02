import { Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { MembershipPlan, MembershipStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { stripe, stripeConfigured, PLAN_PRICE_IDS, planFromPriceId } from '../config/stripe';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { sendMembershipEmail } from '../services/email.service';

/** Static plan catalogue (display data lives here; Stripe holds the billing). */
const PLANS = [
  {
    id: 'ESSENTIAL',
    name: 'Essential',
    price: 49,
    cadence: '/month',
    tagline: 'Find your rhythm',
    features: ['8 classes per month', 'All class types', 'Book 7 days ahead', 'Pause anytime'],
  },
  {
    id: 'UNLIMITED',
    name: 'Unlimited',
    price: 89,
    cadence: '/month',
    tagline: 'Train without limits',
    featured: true,
    features: [
      'Unlimited classes',
      'Priority booking (10 days ahead)',
      'Bring a friend 1×/month',
      'Free program consult',
    ],
  },
  {
    id: 'ANNUAL',
    name: 'Annual',
    price: 790,
    cadence: '/year',
    tagline: 'Two months free',
    features: ['Everything in Unlimited', '2 months free vs monthly', 'Locked-in rate', 'PULSE member kit'],
  },
] as const;

/** GET /api/memberships/plans */
export async function listPlans(_req: Request, res: Response) {
  res.json({
    plans: PLANS,
    stripeConfigured,
    publishableKey: stripeConfigured ? env.stripe.publishableKey : null,
  });
}

const checkoutSchema = z.object({
  plan: z.nativeEnum(MembershipPlan),
});

/**
 * POST /api/memberships/checkout  { plan }
 * Stripe configured → hosted Checkout Session (subscription mode).
 * Not configured → demo activation (clearly labeled, no charge).
 */
export async function checkout(req: Request, res: Response) {
  const { plan } = checkoutSchema.parse(req.body);
  const memberId = req.user!.sub;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { membership: true },
  });
  if (!member) throw ApiError.unauthorized('Account not found');

  if (member.membership && ['ACTIVE', 'TRIALING'].includes(member.membership.status)) {
    throw ApiError.conflict('You already have an active membership — manage it from your dashboard');
  }

  /* ---- Demo mode: activate directly ---- */
  if (!stripeConfigured || !stripe) {
    const periodEnd = new Date();
    periodEnd.setUTCDate(periodEnd.getUTCDate() + (plan === 'ANNUAL' ? 365 : 30));

    await prisma.membership.upsert({
      where: { memberId },
      update: { plan, status: 'ACTIVE', currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false },
      create: { memberId, plan, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    });

    sendMembershipEmail({ name: member.name, email: member.email, plan, demo: true }).catch(() => {});
    return res.json({ demo: true, activated: true });
  }

  /* ---- Real Stripe checkout ---- */
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) throw ApiError.badRequest(`No Stripe price configured for plan ${plan}`);

  let customerId = member.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: member.email,
      name: member.name,
      metadata: { memberId },
    });
    customerId = customer.id;
    await prisma.member.update({ where: { id: memberId }, data: { stripeCustomerId: customerId } });
  }

  const clientUrl = env.clientUrl.split(',')[0].trim();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${clientUrl}/dashboard?checkout=success`,
    cancel_url: `${clientUrl}/pricing?checkout=cancelled`,
    metadata: { memberId, plan },
    subscription_data: { metadata: { memberId, plan } },
  });

  return res.json({ demo: false, url: session.url });
}

/** POST /api/memberships/portal — Stripe billing portal for self-service. */
export async function portal(req: Request, res: Response) {
  if (!stripeConfigured || !stripe) {
    throw ApiError.badRequest('Billing portal is unavailable in demo mode');
  }
  const member = await prisma.member.findUnique({ where: { id: req.user!.sub } });
  if (!member?.stripeCustomerId) throw ApiError.badRequest('No billing profile yet');

  const clientUrl = env.clientUrl.split(',')[0].trim();
  const session = await stripe.billingPortal.sessions.create({
    customer: member.stripeCustomerId,
    return_url: `${clientUrl}/dashboard`,
  });
  res.json({ url: session.url });
}

/** POST /api/memberships/cancel — demo-mode cancel (portal handles real ones). */
export async function demoCancel(req: Request, res: Response) {
  if (stripeConfigured) throw ApiError.badRequest('Use the billing portal to manage your plan');
  const membership = await prisma.membership.findUnique({ where: { memberId: req.user!.sub } });
  if (!membership) throw ApiError.notFound('No membership found');
  await prisma.membership.update({
    where: { id: membership.id },
    data: { status: 'CANCELED', cancelAtPeriodEnd: true },
  });
  res.json({ cancelled: true });
}

/* ------------------------- Stripe webhook ------------------------- */

function statusFromStripe(s: Stripe.Subscription.Status): MembershipStatus {
  switch (s) {
    case 'active':
      return 'ACTIVE';
    case 'trialing':
      return 'TRIALING';
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE';
    case 'canceled':
    case 'incomplete_expired':
      return 'CANCELED';
    default:
      return 'INACTIVE';
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const memberId = sub.metadata?.memberId;
  if (!memberId) return;

  const priceId = sub.items.data[0]?.price?.id ?? '';
  const plan =
    planFromPriceId(priceId) ?? (sub.metadata?.plan as MembershipPlan | undefined) ?? 'ESSENTIAL';

  await prisma.membership.upsert({
    where: { memberId },
    update: {
      plan,
      status: statusFromStripe(sub.status),
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      memberId,
      plan,
      status: statusFromStripe(sub.status),
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

/**
 * POST /api/memberships/webhook  (raw body — mounted before express.json)
 */
export async function webhook(req: Request, res: Response) {
  if (!stripe || !env.stripe.webhookSecret) {
    return res.status(400).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      String(signature),
      env.stripe.webhookSecret,
    );
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Webhook signature verification failed: ${err instanceof Error ? err.message : ''}` });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        await syncSubscription(sub);

        const memberId = sub.metadata?.memberId;
        if (memberId) {
          const member = await prisma.member.findUnique({ where: { id: memberId } });
          if (member) {
            sendMembershipEmail({
              name: member.name,
              email: member.email,
              plan: (sub.metadata?.plan as string) ?? 'Membership',
              demo: false,
            }).catch(() => {});
          }
        }
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return res.json({ received: true });
}
