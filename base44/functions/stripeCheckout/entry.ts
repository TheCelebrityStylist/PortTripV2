import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_IDS = {
  cruise_pass:       Deno.env.get('STRIPE_CRUISE_PASS_PRICE_ID'),
  pro_monthly:       Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID'),
  pro_yearly:        Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID'),
  ultimate_monthly:  Deno.env.get('STRIPE_ULTIMATE_MONTHLY_PRICE_ID'),
  ultimate_yearly:   Deno.env.get('STRIPE_ULTIMATE_YEARLY_PRICE_ID'),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { product, success_url, cancel_url } = await req.json();

    const priceId = PRICE_IDS[product];
    if (!priceId) return Response.json({ error: `Unknown product: ${product}` }, { status: 400 });

    const isSubscription = product !== 'cruise_pass';

    // Get or create Stripe customer
    const users = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const userData = users[0];
    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { base44_user_id: user.id },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${req.headers.get('origin')}/dashboard?upgraded=1`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/dashboard`,
      metadata: { base44_user_id: user.id, product },
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});