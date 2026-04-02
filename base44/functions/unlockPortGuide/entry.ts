import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FREE_LIMIT = 3;
const FREE_TIER = 'free';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { port_city, check_only } = await req.json();
    if (!port_city) return Response.json({ error: 'port_city required' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const userData = users[0];
    const planTier = userData?.plan_tier || FREE_TIER;
    const isPaid = planTier !== FREE_TIER;

    // Paid users get full access
    if (isPaid) {
      return Response.json({ access: true, isPaid: true, planTier, freeUsed: 0, freeLimit: FREE_LIMIT });
    }

    const freeGuides = userData?.free_port_guides || [];
    const freeUsed = freeGuides.length;

    // Already unlocked
    if (freeGuides.includes(port_city)) {
      return Response.json({ access: true, isPaid: false, planTier, freeGuides, freeUsed, freeLimit: FREE_LIMIT });
    }

    if (check_only) {
      if (freeUsed >= FREE_LIMIT) {
        return Response.json({ access: false, locked: true, isPaid: false, planTier, freeGuides, freeUsed, freeLimit: FREE_LIMIT });
      }
      return Response.json({ access: false, hasFreeSlotsLeft: true, canUnlock: true, isPaid: false, planTier, freeGuides, freeUsed, freeLimit: FREE_LIMIT });
    }

    // Unlock attempt: at limit
    if (freeUsed >= FREE_LIMIT) {
      return Response.json({ access: false, locked: true, isPaid: false, planTier, freeGuides, freeUsed, freeLimit: FREE_LIMIT });
    }

    // Unlock
    const updated = [...freeGuides, port_city];
    await base44.asServiceRole.entities.User.update(user.id, { free_port_guides: updated });

    return Response.json({ access: true, isPaid: false, planTier, freeGuides: updated, freeUsed: updated.length, freeLimit: FREE_LIMIT });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});