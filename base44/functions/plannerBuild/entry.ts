/**
 * PortTrip Hybrid Planning Engine
 * Architecture: Google Places → Candidates → Deterministic Scoring → Route Building → AI Enrichment
 * 
 * Flow:
 * 1. Resolve port city to coordinates
 * 2. Fetch 30-60 candidate POIs from Google Places (New API)
 * 3. Merge curated cruise-specific data
 * 4. Score all candidates deterministically
 * 5. Build 3 plan variants (best_overall, best_value, least_stress)
 * 6. Route each variant using nearest-neighbor + travel time estimates
 * 7. Use OpenAI only for plan naming, summaries, and explanations
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai';

const GOOGLE_PLACES_BASE = 'https://places.googleapis.com/v1/places:searchNearby';
const GOOGLE_ROUTES_MATRIX = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');

// ─── Port Coordinates (cruise ports) ────────────────────────────────────────
const PORT_COORDS = {
  'barcelona': { lat: 41.3483, lng: 2.1734, city: 'Barcelona' },
  'dubrovnik': { lat: 42.6556, lng: 18.0783, city: 'Dubrovnik' },
  'santorini': { lat: 36.4618, lng: 25.3753, city: 'Santorini' },
  'rome': { lat: 41.6260, lng: 12.2360, city: 'Civitavecchia' },
  'civitavecchia': { lat: 41.6260, lng: 12.2360, city: 'Rome (Civitavecchia)' },
  'naples': { lat: 40.8389, lng: 14.2630, city: 'Naples' },
  'athens': { lat: 37.9475, lng: 23.6420, city: 'Athens (Piraeus)' },
  'piraeus': { lat: 37.9475, lng: 23.6420, city: 'Athens' },
  'kotor': { lat: 42.4247, lng: 18.7712, city: 'Kotor' },
  'dubrovnik': { lat: 42.6556, lng: 18.0783, city: 'Dubrovnik' },
  'split': { lat: 43.5047, lng: 16.4435, city: 'Split' },
  'venice': { lat: 45.4324, lng: 12.3461, city: 'Venice' },
  'florence': { lat: 43.5752, lng: 10.3083, city: 'Livorno (Florence)' },
  'livorno': { lat: 43.5752, lng: 10.3083, city: 'Livorno' },
  'marseille': { lat: 43.3388, lng: 5.2146, city: 'Marseille' },
  'palma': { lat: 39.5478, lng: 2.6277, city: 'Palma de Mallorca' },
  'malaga': { lat: 36.6720, lng: -4.4342, city: 'Málaga' },
  'cadiz': { lat: 36.5265, lng: -6.2876, city: 'Cádiz' },
  'lisbon': { lat: 38.7070, lng: -9.1355, city: 'Lisbon' },
  'valletta': { lat: 35.8997, lng: 14.5146, city: 'Valletta' },
  'mykonos': { lat: 37.4453, lng: 25.3287, city: 'Mykonos' },
  'rhodes': { lat: 36.4450, lng: 28.2246, city: 'Rhodes' },
  'corfu': { lat: 39.6243, lng: 19.9217, city: 'Corfu' },
  'kusadasi': { lat: 37.8600, lng: 27.2594, city: 'Kusadasi (Ephesus)' },
  'istanbul': { lat: 41.0082, lng: 28.9784, city: 'Istanbul' },
  'alesund': { lat: 62.4723, lng: 6.1547, city: 'Ålesund' },
  'bergen': { lat: 60.3929, lng: 5.3248, city: 'Bergen' },
  'flam': { lat: 60.8640, lng: 7.1182, city: 'Flåm' },
  'nassau': { lat: 25.0478, lng: -77.3537, city: 'Nassau' },
  'cozumel': { lat: 20.5093, lng: -86.9475, city: 'Cozumel' },
  'montego bay': { lat: 18.4711, lng: -77.9196, city: 'Montego Bay' },
  'bridgetown': { lat: 13.1132, lng: -59.6129, city: 'Bridgetown' },
  'st thomas': { lat: 18.3421, lng: -64.9307, city: 'St Thomas' },
};

function resolvePort(cityName) {
  const key = cityName.toLowerCase().trim();
  for (const [k, v] of Object.entries(PORT_COORDS)) {
    if (key.includes(k) || k.includes(key)) return { ...v, portLat: v.lat, portLng: v.lng };
  }
  return null;
}

// ─── Google Places Fetch ─────────────────────────────────────────────────────
async function fetchGooglePlaces(portLat, portLng, radiusMeters = 8000) {
  if (!GOOGLE_KEY) return [];
  const types = [
    ['tourist_attraction', 'museum', 'church', 'art_gallery'],
    ['restaurant', 'cafe'],
    ['park', 'natural_feature'],
    ['shopping_mall', 'market'],
  ];

  const allPlaces = [];
  for (const typeGroup of types) {
    try {
      const res = await fetch(GOOGLE_PLACES_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_KEY,
          'X-Goog-FieldMask': [
            'places.id', 'places.displayName', 'places.location',
            'places.formattedAddress', 'places.types', 'places.primaryType',
            'places.rating', 'places.userRatingCount', 'places.priceLevel',
            'places.currentOpeningHours', 'places.editorialSummary',
          ].join(','),
        },
        body: JSON.stringify({
          includedTypes: typeGroup,
          maxResultCount: 15,
          languageCode: 'en',
          locationRestriction: {
            circle: {
              center: { latitude: portLat, longitude: portLng },
              radius: radiusMeters,
            },
          },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        allPlaces.push(...(json.places || []));
      }
    } catch (_) { /* continue */ }
  }
  return allPlaces;
}

// ─── Google Routes Matrix ────────────────────────────────────────────────────
async function computeGoogleMatrix(originLat, originLng, destinations, mode = 'WALK') {
  if (!GOOGLE_KEY || !destinations.length) return [];
  try {
    const body = {
      origins: [{ waypoint: { location: { latLng: { latitude: originLat, longitude: originLng } } } }],
      destinations: destinations.map(d => ({ waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } } })),
      travelMode: mode === 'WALK' ? 'WALK' : 'DRIVE',
    };
    const res = await fetch(GOOGLE_ROUTES_MATRIX, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.map(r => ({
      destIndex: r.destinationIndex,
      durationMin: Math.ceil(Number(r.duration?.replace('s', '') || 600) / 60),
      distanceMeters: r.distanceMeters || 0,
    }));
  } catch (_) { return null; }
}

// ─── Mapbox Matrix Fallback ──────────────────────────────────────────────────
async function computeMapboxMatrix(originLat, originLng, destinations, mode = 'walking') {
  if (!MAPBOX_TOKEN || !destinations.length) return null;
  try {
    const coords = [`${originLng},${originLat}`, ...destinations.map(d => `${d.lng},${d.lat}`)].join(';');
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${mode}/${coords}?sources=0&annotations=duration,distance&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return destinations.map((_, i) => ({
      destIndex: i,
      durationMin: Math.ceil((json.durations?.[0]?.[i + 1] || 600) / 60),
      distanceMeters: Math.round(json.distances?.[0]?.[i + 1] || 0),
    }));
  } catch (_) { return null; }
}

async function getMatrix(originLat, originLng, destinations, mode) {
  const googleMode = mode === 'walk' ? 'WALK' : 'DRIVE';
  const result = await computeGoogleMatrix(originLat, originLng, destinations, googleMode);
  if (result) return result;
  const mapboxMode = mode === 'walk' ? 'walking' : 'driving';
  const fallback = await computeMapboxMatrix(originLat, originLng, destinations, mapboxMode);
  if (fallback) return fallback;
  // Heuristic fallback using Haversine
  return destinations.map((d, i) => {
    const dx = originLat - d.lat;
    const dy = (originLng - d.lng) * Math.cos(originLat * Math.PI / 180);
    const km = Math.sqrt(dx * dx + dy * dy) * 111;
    const durationMin = mode === 'walk' ? Math.round(km / 0.065) : Math.round(km / 0.5 + 5);
    return { destIndex: i, durationMin: Math.max(3, durationMin), distanceMeters: Math.round(km * 1000) };
  });
}

// ─── Normalize Google Place → PlaceNode ─────────────────────────────────────
function normalizeGooglePlace(raw) {
  const rating = raw.rating || 4.0;
  const reviews = raw.userRatingCount || 0;
  const primaryType = raw.primaryType || raw.types?.[0] || 'tourist_attraction';
  const isFood = ['restaurant', 'cafe', 'food'].includes(primaryType);
  const isPark = primaryType === 'park';

  const visitMin = isFood ? 60 : primaryType === 'museum' ? 90 : isPark ? 55 : primaryType === 'church' ? 35 : 65;
  const priceLevel = raw.priceLevel ? Number(raw.priceLevel.replace('PRICE_LEVEL_', '')) : (isFood ? 2 : 0);
  const costEur = isFood ? ([0, 12, 22, 40, 70][priceLevel] || 18) : (primaryType === 'museum' ? 14 : primaryType === 'tourist_attraction' ? 10 : 0);
  const popularityScore = Math.min(100, Math.round(rating * 14 + Math.log10(reviews + 1) * 13));
  const touristTrap = reviews > 8000 && rating < 4.2 ? 'high' : reviews > 4000 && rating < 4.4 ? 'medium' : 'low';

  return {
    id: raw.id,
    provider: 'google',
    placeId: raw.id,
    name: raw.displayName?.text || 'Unknown',
    lat: raw.location?.latitude,
    lng: raw.location?.longitude,
    address: raw.formattedAddress || '',
    types: raw.types || [],
    primaryType,
    rating,
    userRatingCount: reviews,
    priceLevel,
    openNow: raw.currentOpeningHours?.openNow ?? true,
    openingHoursText: raw.currentOpeningHours?.weekdayDescriptions || [],
    editorialSummary: raw.editorialSummary?.text || '',
    estimatedVisitMin: visitMin,
    estimatedCostEur: costEur,
    popularityScore,
    uniquenessScore: 50,
    cruiseSuitabilityScore: isPark ? 60 : 70,
    localCharacterScore: isFood ? 75 : primaryType === 'market' ? 80 : 45,
    hiddenGemScore: reviews < 500 && rating >= 4.5 ? 80 : 30,
    touristTrapRisk: touristTrap,
    category: isFood ? 'food' : isPark ? 'viewpoint' : 'attraction',
  };
}

// ─── Candidate Scoring ───────────────────────────────────────────────────────
function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = (bLat - aLat) * Math.PI / 180;
  const dLng = (bLng - aLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function preferenceScore(travelStyle, p) {
  const t = p.primaryType || '';
  switch (travelStyle) {
    case 'food': return p.category === 'food' ? 100 : 35;
    case 'culture': case 'history': return ['museum', 'church', 'tourist_attraction', 'art_gallery'].includes(t) ? 90 : 50;
    case 'first_time': return p.popularityScore > 70 ? 85 : 55;
    case 'nature': return t === 'park' ? 95 : 40;
    case 'luxury': return p.priceLevel >= 3 ? 85 : 40;
    case 'hidden_gems': return p.hiddenGemScore > 60 ? 90 : p.popularityScore < 50 ? 70 : 35;
    case 'cruise_safe': return p.cruiseSuitabilityScore;
    case 'family_friendly': return ['park', 'museum', 'tourist_attraction'].includes(t) ? 80 : 55;
    default: return 60;
  }
}

function scoreCandidate(portLat, portLng, travelStyle, p) {
  const km = haversineKm(portLat, portLng, p.lat, p.lng);
  const distEff = Math.max(0, 100 - km * 11);
  const reviewStr = Math.min(100, Math.round(p.rating * 14 + Math.log10(p.userRatingCount + 1) * 13));
  const costEff = Math.max(20, 100 - p.estimatedCostEur * 2);
  return Math.round(
    preferenceScore(travelStyle, p) * 0.30 +
    p.uniquenessScore * 0.20 +
    distEff * 0.15 +
    p.cruiseSuitabilityScore * 0.20 +
    costEff * 0.05 +
    reviewStr * 0.10
  );
}

// ─── Variant-specific sorting ─────────────────────────────────────────────────
function rankForVariant(variant, candidates, portLat, portLng) {
  const sorted = [...candidates];
  if (variant === 'best_value') {
    sorted.sort((a, b) => (b.candidateScore - b.estimatedCostEur * 1.5) - (a.candidateScore - a.estimatedCostEur * 1.5));
  } else if (variant === 'least_stress') {
    sorted.sort((a, b) => {
      const aKm = haversineKm(portLat, portLng, a.lat, a.lng);
      const bKm = haversineKm(portLat, portLng, b.lat, b.lng);
      return (b.cruiseSuitabilityScore - bKm * 5) - (a.cruiseSuitabilityScore - aKm * 5);
    });
  } else if (variant === 'local_vibe') {
    sorted.sort((a, b) => (b.localCharacterScore + b.hiddenGemScore) - (a.localCharacterScore + a.hiddenGemScore));
  } else if (variant === 'low_walking') {
    sorted.sort((a, b) => haversineKm(portLat, portLng, a.lat, a.lng) - haversineKm(portLat, portLng, b.lat, b.lng));
  } else {
    sorted.sort((a, b) => b.candidateScore - a.candidateScore);
  }
  return sorted;
}

// ─── Nearest Neighbor Route ──────────────────────────────────────────────────
function nearestNeighbor(portLat, portLng, nodes) {
  const remaining = [...nodes];
  const ordered = [];
  let curLat = portLat, curLng = portLng;
  while (remaining.length) {
    remaining.sort((a, b) => haversineKm(curLat, curLng, a.lat, a.lng) - haversineKm(curLat, curLng, b.lat, b.lng));
    const next = remaining.shift();
    ordered.push(next);
    curLat = next.lat;
    curLng = next.lng;
  }
  return ordered;
}

function timeToMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function minsToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(Math.floor(mins % 60)).padStart(2, '0');
  return `${h}:${m}`;
}

function estimateTransportCost(mode, km) {
  if (mode === 'walk') return 0;
  if (mode === 'taxi') return Math.round((4 + km * 2.2) * 10) / 10;
  return 2.5;
}

// ─── Build Single Variant Plan ────────────────────────────────────────────────
async function buildVariantPlan(variant, ctx, ranked) {
  const { portLat, portLng, allAboard, bufferMins, tenderMins, dockTime } = ctx;
  const startMins = timeToMins(dockTime || '08:00') + (tenderMins || 0);
  const leaveBy = timeToMins(allAboard) - (bufferMins || 90) - (tenderMins || 0);

  // Insert one food stop if variant is not pure food and candidates contain food
  const stops = [];
  const legs = [];
  const foodCandidates = ranked.filter(p => p.category === 'food');
  const attractionCandidates = ranked.filter(p => p.category !== 'food');

  // Select 3-4 attractions + 1 food
  const selectedAttractions = attractionCandidates.slice(0, variant === 'least_stress' ? 3 : 4);
  const selectedFood = foodCandidates.slice(0, 1);
  let selected = nearestNeighbor(portLat, portLng, [...selectedAttractions, ...selectedFood]);

  // Insert food near the middle
  if (selectedFood.length > 0 && selectedAttractions.length >= 2) {
    const foodPlace = selected.find(p => p.category === 'food');
    if (foodPlace) {
      const midIdx = Math.floor(selected.length / 2);
      selected = selected.filter(p => p.id !== foodPlace.id);
      selected.splice(midIdx, 0, foodPlace);
    }
  }

  // Get travel times from port to first stop
  const matrixMode = variant === 'low_walking' ? 'taxi' : 'walk';
  const allNodes = selected;

  // Build legs using matrix
  let currentMins = startMins;
  let prevLat = portLat, prevLng = portLng, prevId = 'port';

  for (let i = 0; i < selected.length; i++) {
    const place = selected[i];
    const matrix = await getMatrix(prevLat, prevLng, [place], matrixMode);
    const edge = matrix[0];
    const km = edge.distanceMeters / 1000;
    const legMode = (variant === 'low_walking' || km > 1.5) ? 'taxi' : 'walk';
    const legDuration = edge.durationMin;
    const legCost = estimateTransportCost(legMode, km);

    const legStart = currentMins;
    const legEnd = currentMins + legDuration;
    currentMins = legEnd;

    if (i > 0 || prevId === 'port') {
      legs.push({
        fromStopId: prevId,
        toStopId: place.id,
        mode: legMode,
        durationMin: legDuration,
        distanceMeters: edge.distanceMeters,
        estimatedCostEur: legCost,
        notes: legMode === 'walk'
          ? `${Math.round(km * 1000)}m walk, ~${legDuration}min`
          : `Taxi ~${legDuration}min, est. €${legCost}`,
      });
    }

    const stopEnd = currentMins + place.estimatedVisitMin;
    if (stopEnd > leaveBy + 20) {
      // Too close to deadline — skip remaining
      break;
    }

    stops.push({
      id: place.id,
      placeId: place.placeId || place.id,
      title: place.name,
      subtitle: place.address || '',
      startTime: minsToTime(currentMins),
      endTime: minsToTime(currentMins + place.estimatedVisitMin),
      durationMin: place.estimatedVisitMin,
      estimatedCostEur: place.estimatedCostEur,
      stopScore: Math.round((place.popularityScore + place.cruiseSuitabilityScore) / 2),
      worthItScore: Math.round((place.popularityScore + place.uniquenessScore) / 2),
      why: place.editorialSummary || `Rated ${place.rating}⭐ by ${place.userRatingCount?.toLocaleString() || '?'} visitors`,
      insiderTip: place.category === 'food'
        ? 'Order what locals eat — skip the tourist menu'
        : place.rating >= 4.7
        ? 'Best visited early — crowds build after 10am'
        : 'Skip the front entrance queue — there may be a side entry',
      touristTrapRisk: place.touristTrapRisk,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      priceLevel: place.priceLevel,
      openNow: place.openNow,
      openingHoursText: place.openingHoursText,
      category: place.category,
      lat: place.lat,
      lng: place.lng,
      // Nearby alternatives pool reference
      _candidatePool: null, // filled in post-processing
    });

    currentMins += place.estimatedVisitMin;
    prevLat = place.lat;
    prevLng = place.lng;
    prevId = place.id;
  }

  // Compute return leg
  const returnMatrix = await getMatrix(prevLat, prevLng, [{ lat: portLat, lng: portLng }], 'taxi');
  const returnLeg = returnMatrix[0];
  const returnKm = returnLeg.distanceMeters / 1000;
  if (prevId !== 'port') {
    legs.push({
      fromStopId: prevId,
      toStopId: 'port',
      mode: 'taxi',
      durationMin: returnLeg.durationMin,
      distanceMeters: returnLeg.distanceMeters,
      estimatedCostEur: estimateTransportCost('taxi', returnKm),
      notes: `Return to ship — arrive by ${minsToTime(leaveBy)}`,
    });
  }

  const totalCost = stops.reduce((s, x) => s + x.estimatedCostEur, 0) +
    legs.reduce((s, x) => s + x.estimatedCostEur, 0);
  const walkLegs = legs.filter(l => l.mode === 'walk');
  const totalWalkingMin = walkLegs.reduce((s, l) => s + l.durationMin, 0);
  const totalTransportMin = legs.reduce((s, l) => s + l.durationMin, 0);
  const totalSightseeingMin = stops.reduce((s, x) => s + x.durationMin, 0);
  const safeBuffer = leaveBy - (currentMins + returnLeg.durationMin);
  const safeReturnScore = Math.max(0, Math.min(100, Math.round(50 + safeBuffer * 0.8)));
  const avgWorthIt = stops.reduce((s, x) => s + x.worthItScore, 0) / Math.max(1, stops.length);
  const routeLogic = Math.max(30, 100 - Math.max(0, totalTransportMin - 40) * 1.2);
  const costEff = ctx.shipExcursionPrice > 0
    ? Math.min(100, 50 + ((ctx.shipExcursionPrice - totalCost) / ctx.shipExcursionPrice) * 80)
    : Math.max(20, 100 - totalCost);

  const scoreBreakdown = {
    cruiseSafety: Math.round(Math.max(0, Math.min(100, safeReturnScore))),
    timeEfficiency: Math.round(Math.max(30, Math.min(100, 100 - Math.max(0, totalTransportMin - 30) * 1.5))),
    sightseeingValue: Math.round(Math.max(30, Math.min(100, avgWorthIt))),
    costEfficiency: Math.round(Math.max(20, Math.min(100, costEff))),
    walkingComfort: Math.round(Math.max(30, Math.min(100, 100 - Math.max(0, totalWalkingMin - 30) * 1.2))),
    routeLogic: Math.round(Math.max(30, Math.min(100, routeLogic))),
    localCharacter: variant === 'local_vibe' ? 88 : 58,
    personalFit: variant === 'best_overall' ? 84 : 72,
  };

  const planScore = Math.round(
    scoreBreakdown.cruiseSafety * 0.22 +
    scoreBreakdown.timeEfficiency * 0.18 +
    scoreBreakdown.sightseeingValue * 0.18 +
    scoreBreakdown.routeLogic * 0.12 +
    scoreBreakdown.personalFit * 0.12 +
    scoreBreakdown.costEfficiency * 0.08 +
    scoreBreakdown.walkingComfort * 0.05 +
    scoreBreakdown.localCharacter * 0.05
  );

  return {
    variantType: variant,
    planName: `${ctx.cityName} ${VARIANT_NAMES[variant]}`,
    summary: VARIANT_SUMMARIES[variant](ctx),
    planScore,
    scoreBreakdown,
    whyThisPlanWorks: buildWhyItWorks(scoreBreakdown, ctx, totalCost),
    biggestWeakness: totalWalkingMin > 45 ? 'Walking load is moderately high — could substitute one leg with metro or taxi.' : avgWorthIt < 65 ? 'Could use one more high-uniqueness stop to lift sightseeing value.' : 'Plan is well-rounded — minor scheduling refinements could add 3-5 pts.',
    fastestImprovement: totalWalkingMin > 45 ? 'Swap one walking leg to taxi to reduce fatigue and gain 8+ pts.' : 'Add one hidden gem stop to increase local character score.',
    totalEstimatedCost: Math.round(totalCost),
    savingsVsShipExcursion: ctx.shipExcursionPrice > 0 ? Math.max(0, Math.round(ctx.shipExcursionPrice - totalCost)) : null,
    totalWalkingMinutes: totalWalkingMin,
    totalTransportMinutes: totalTransportMin,
    totalSightseeingMinutes: totalSightseeingMin,
    recommendedReturnStartTime: minsToTime(leaveBy),
    safeReturnScore: scoreBreakdown.cruiseSafety,
    stops,
    transportLegs: legs,
    backupPlan: [
      { trigger: 'Running 20+ minutes late', action: `Skip the last optional stop and head directly to port. Take taxi — €${estimateTransportCost('taxi', haversineKm(prevLat, prevLng, portLat, portLng)?.toFixed(1) || 3)}.` },
      { trigger: 'Long queue at major attraction', action: 'Cap the stop at 30 minutes and move on — time > completeness.' },
      { trigger: 'Bad weather', action: 'Swap outdoor stops for the museum or covered market.' },
    ],
  };
}

const VARIANT_NAMES = {
  best_overall: 'Smart Port Day',
  best_value: 'Best-Value Day',
  least_stress: 'Cruise-Safe Day',
  local_vibe: 'Local Vibe Day',
  low_walking: 'Low-Walking Route',
  max_sights: 'Max Sights Day',
};

const VARIANT_SUMMARIES = {
  best_overall: (ctx) => `Balanced, high-scoring route for ${ctx.cityName} — strong sightseeing, sensible spend, and a safe return buffer.`,
  best_value: (ctx) => `Maximum value for ${ctx.cityName} — same quality highlights at the lowest cost vs ship pricing.`,
  least_stress: (ctx) => `The safest, most relaxed ${ctx.cityName} day — extended return buffer, minimal transfers, maximum peace of mind.`,
  local_vibe: (ctx) => `Discover the real ${ctx.cityName} — fewer crowds, more character, one moment you'll actually remember.`,
  low_walking: (ctx) => `Comfort-first ${ctx.cityName} route — transport-heavy design for those who want to see more and walk less.`,
  max_sights: (ctx) => `The packed ${ctx.cityName} day — every major landmark, tightly timed, for the traveler who wants the visual full hand.`,
};

function buildWhyItWorks(score, ctx, totalCost) {
  const reasons = [];
  if (score.cruiseSafety >= 80) reasons.push(`Protects a strong return buffer — ${ctx.bufferMins}min back-to-ship safety margin`);
  if (score.timeEfficiency >= 75) reasons.push('Stops are clustered geographically to cut wasted transit time');
  if (score.sightseeingValue >= 70) reasons.push('Anchored by high-rated stops with proven visitor satisfaction');
  if (ctx.shipExcursionPrice > 0 && totalCost < ctx.shipExcursionPrice) reasons.push(`Saves €${Math.round(ctx.shipExcursionPrice - totalCost)} vs the ship excursion pricing`);
  if (score.localCharacter >= 75) reasons.push('Balances well-known highlights with genuine local character');
  if (score.walkingComfort >= 80) reasons.push('Keeps walking comfortable — no unreasonably long legs');
  return reasons.slice(0, 5);
}

// ─── AI Enrichment (names / explanations only) ───────────────────────────────
async function enrichWithAI(ctx, plans) {
  try {
    const prompt = `You are a premium cruise travel strategist. Given these ${plans.length} port day itinerary variants for ${ctx.cityName}, improve only the names, summaries, and "whyThisPlanWorks" bullets. Do NOT change any scores, stops, or times.

Return valid JSON: { "enriched": [ { "variantType": "...", "planName": "...", "summary": "...", "whyThisPlanWorks": ["..."] } ] }

Plans:
${JSON.stringify(plans.map(p => ({ variantType: p.variantType, planScore: p.planScore, stops: p.stops.map(s => s.title), totalCost: p.totalEstimatedCost, walking: p.totalWalkingMinutes })))}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });
    const enriched = JSON.parse(res.choices[0].message.content).enriched || [];
    for (const e of enriched) {
      const plan = plans.find(p => p.variantType === e.variantType);
      if (plan) {
        if (e.planName) plan.planName = e.planName;
        if (e.summary) plan.summary = e.summary;
        if (e.whyThisPlanWorks?.length) plan.whyThisPlanWorks = e.whyThisPlanWorks;
      }
    }
  } catch (_) { /* AI enrichment optional */ }
  return plans;
}

// ─── Build Alternatives for each stop ────────────────────────────────────────
function buildAlternatives(stop, allCandidates, count = 4) {
  return allCandidates
    .filter(c => c.id !== stop.id && c.category === stop.category)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, count)
    .map(c => ({
      id: c.id,
      title: c.name,
      subtitle: c.address,
      rating: c.rating,
      userRatingCount: c.userRatingCount,
      estimatedCostEur: c.estimatedCostEur,
      estimatedVisitMin: c.estimatedVisitMin,
      distanceKm: Math.round(haversineKm(stop.lat, stop.lng, c.lat, c.lng) * 10) / 10,
      touristTrapRisk: c.touristTrapRisk,
      category: c.category,
      worthItScore: Math.round((c.popularityScore + c.cruiseSuitabilityScore) / 2),
    }));
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { plan } = body;

  // Resolve coordinates
  const portCoords = resolvePort(plan.port_city);
  if (!portCoords) {
    return Response.json({ error: `Unknown port: ${plan.port_city}` }, { status: 400 });
  }

  const ctx = {
    portLat: portCoords.portLat,
    portLng: portCoords.portLng,
    cityName: portCoords.city || plan.port_city,
    allAboard: plan.all_aboard_time || '17:00',
    dockTime: plan.dock_time || '08:00',
    bufferMins: parseInt(plan.buffer_minutes) || 90,
    tenderMins: parseInt(plan.tender_delay_minutes) || 0,
    travelStyle: plan.travel_mode || 'first_time',
    groupType: plan.group_type || 'couple',
    shipExcursionPrice: parseFloat(plan.ship_excursion_price) || 0,
    diyBudget: parseFloat(plan.diy_budget) || 0,
    mustSee: plan.must_see || '',
    avoid: plan.avoid || '',
  };

  // 1. Fetch candidates from Google Places
  const rawPlaces = await fetchGooglePlaces(ctx.portLat, ctx.portLng);

  // 2. Normalize and score candidates
  const candidates = rawPlaces
    .filter(p => p.location?.latitude && p.location?.longitude)
    .map(p => {
      const node = normalizeGooglePlace(p);
      return { ...node, candidateScore: scoreCandidate(ctx.portLat, ctx.portLng, ctx.travelStyle, node) };
    })
    .filter(p => p.candidateScore > 20)
    .sort((a, b) => b.candidateScore - a.candidateScore);

  // Fallback: if Google not configured, return signal
  const hasRealData = candidates.length > 0;

  // 3. Generate 3 plan variants
  const VARIANTS = ['best_overall', 'best_value', 'least_stress'];
  const plans = [];
  for (const variant of VARIANTS) {
    const ranked = rankForVariant(variant, candidates.length > 0 ? candidates : [], ctx.portLat, ctx.portLng);
    if (ranked.length === 0) break;
    const plan = await buildVariantPlan(variant, ctx, ranked);
    plans.push(plan);
  }

  // 4. AI enrichment (names/summaries only)
  if (plans.length > 0) {
    await enrichWithAI(ctx, plans);
  }

  // 5. Attach alternatives to each stop in the best plan
  if (plans.length > 0) {
    for (const p of plans) {
      for (const stop of p.stops) {
        stop.alternatives = buildAlternatives(stop, candidates);
      }
    }
  }

  return Response.json({
    plans,
    candidatesCount: candidates.length,
    hasRealData,
    portResolved: { ...portCoords },
  });
});