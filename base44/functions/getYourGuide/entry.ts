import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// GetYourGuide Partner API — fetches tours/activities for a given city
// Docs: https://partner.getyourguide.com/api
// Requires GETYOURGUIDE_API_KEY secret

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { city, query, limit = 6, currency = 'EUR', language = 'en-US' } = await req.json();
    if (!city) return Response.json({ error: 'city is required' }, { status: 400 });

    const apiKey = Deno.env.get('GETYOURGUIDE_API_KEY');
    if (!apiKey) {
      // Graceful fallback — return empty so UI handles gracefully
      return Response.json({ success: true, activities: [], fallback: true, reason: 'API key not configured' });
    }

    // Search by city name using GYG partner API
    const searchQuery = query || city;
    const url = `https://api.getyourguide.com/1/activities?q=${encodeURIComponent(searchQuery)}&lang=${language}&currency=${currency}&limit=${limit}&sort_by=rating`;

    const res = await fetch(url, {
      headers: {
        'X-ACCESS-TOKEN': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ success: false, error: `GYG API error: ${res.status} ${errText}`, activities: [], fallback: true });
    }

    const data = await res.json();
    const activities = (data.data?.activities || []).map(a => ({
      id: a.activity_id,
      title: a.title,
      abstract: a.abstract,
      duration: a.duration?.label || '',
      price: a.price ? { amount: a.price.amount, currency: a.price.currency_code } : null,
      rating: a.rating?.avg || null,
      reviewCount: a.rating?.count || 0,
      categories: a.categories?.map(c => c.title) || [],
      bookingUrl: a.url || `https://www.getyourguide.com/`,
      imageUrl: a.pictures?.[0]?.url_original || null,
      isFreeEntry: (a.price?.amount || 0) === 0,
      city: a.locations?.[0]?.short_name || city,
    }));

    return Response.json({ success: true, activities, total: data.data?.total_activities || activities.length });
  } catch (error) {
    return Response.json({ success: false, error: error.message, activities: [], fallback: true });
  }
});