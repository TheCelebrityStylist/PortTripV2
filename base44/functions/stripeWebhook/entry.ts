import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const PRICE_TO_TIER = {
  [Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID')]:      'pro',
  [Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID')]:       'pro',
  [Deno.env.get('STRIPE_ULTIMATE_MONTHLY_PRICE_ID')]: 'ultimate',
  [Deno.env.get('STRIPE_ULTIMATE_YEARLY_PRICE_ID')]:  'ultimate',
  [Deno.env.get('STRIPE_CRUISE_PASS_PRICE_ID')]:      'cruise_pass',
};

async function findUserByCustomerId(base44, customerId) {
  const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
  return users[0] || null;
}

async function findUserByEmail(base44, email) {
  const users = await base44.asServiceRole.entities.User.filter({ email });
  return users[0] || null;
}

async function upgradeTier(base44, userId, tier, subscriptionId) {
  const update = { plan_tier: tier };
  if (subscriptionId) update.stripe_subscription_id = subscriptionId;
  await base44.asServiceRole.entities.User.update(userId, update);
}

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.base44_user_id;
      const product = session.metadata?.product;
      const customerId = session.customer;

      let user = userId
        ? (await base44.asServiceRole.entities.User.filter({ id: userId }))[0]
        : await findUserByCustomerId(base44, customerId);

      if (!user && session.customer_details?.email) {
        user = await findUserByEmail(base44, session.customer_details.email);
      }

      if (!user) return Response.json({ received: true });

      if (!user.stripe_customer_id) {
        await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
      }

      if (product === 'cruise_pass') {
        await upgradeTier(base44, user.id, 'cruise_pass', null);
      } else if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = sub.items.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || 'pro';
        await upgradeTier(base44, user.id, tier, session.subscription);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const user = await findUserByCustomerId(base44, sub.customer);
      if (!user) return Response.json({ received: true });

      const priceId = sub.items.data[0]?.price?.id;
      const tier = PRICE_TO_TIER[priceId] || 'pro';

      if (sub.status === 'active' || sub.status === 'trialing') {
        await upgradeTier(base44, user.id, tier, sub.id);
      } else if (['canceled', 'unpaid', 'past_due'].includes(sub.status)) {
        await base44.asServiceRole.entities.User.update(user.id, { plan_tier: 'free', stripe_subscription_id: '' });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const user = await findUserByCustomerId(base44, sub.customer);
      if (user) {
        await base44.asServiceRole.entities.User.update(user.id, { plan_tier: 'free', stripe_subscription_id: '' });
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const user = await findUserByCustomerId(base44, sub.customer);
        if (!user) return Response.json({ received: true });
        const priceId = sub.items.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || 'pro';
        await upgradeTier(base44, user.id, tier, invoice.subscription);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});