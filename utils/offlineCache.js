/**
 * Offline cache utility for PortTrip.
 * Stores unlocked port guides and generated itineraries in localStorage
 * so they're accessible during cruises without internet.
 */

const CACHE_VERSION = 'v1';
const GUIDES_KEY = `porttrip_${CACHE_VERSION}_guides`;
const PLANS_KEY = `porttrip_${CACHE_VERSION}_plans`;
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function now() { return Date.now(); }

// ─── Port Guide Cache ─────────────────────────────────────────────────────────

export function cachePortGuide(city, data) {
  try {
    const all = getAll(GUIDES_KEY);
    all[city.toLowerCase()] = { data, cachedAt: now() };
    localStorage.setItem(GUIDES_KEY, JSON.stringify(all));
  } catch (_) {}
}

export function getCachedPortGuide(city) {
  try {
    const all = getAll(GUIDES_KEY);
    const entry = all[city?.toLowerCase()];
    if (!entry) return null;
    if (now() - entry.cachedAt > CACHE_TTL_MS) return null;
    return entry.data;
  } catch (_) { return null; }
}

export function hasCachedPortGuide(city) {
  return !!getCachedPortGuide(city);
}

export function getCachedGuideList() {
  try {
    const all = getAll(GUIDES_KEY);
    return Object.keys(all).filter(city => {
      const e = all[city];
      return e && (now() - e.cachedAt) <= CACHE_TTL_MS;
    });
  } catch (_) { return []; }
}

// ─── Itinerary / Plan Cache ───────────────────────────────────────────────────

export function cachePlan(planId, planData, blocks) {
  try {
    const all = getAll(PLANS_KEY);
    all[planId] = { planData, blocks, cachedAt: now() };
    localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  } catch (_) {}
}

export function getCachedPlan(planId) {
  try {
    const all = getAll(PLANS_KEY);
    const entry = all[planId];
    if (!entry) return null;
    if (now() - entry.cachedAt > CACHE_TTL_MS) return null;
    return entry;
  } catch (_) { return null; }
}

export function getCachedPlanList() {
  try {
    const all = getAll(PLANS_KEY);
    return Object.entries(all)
      .filter(([, e]) => e && (now() - e.cachedAt) <= CACHE_TTL_MS)
      .map(([id, e]) => ({ id, port_city: e.planData?.port_city, cachedAt: e.cachedAt, blockCount: e.blocks?.length || 0 }));
  } catch (_) { return []; }
}

export function removeCachedPlan(planId) {
  try {
    const all = getAll(PLANS_KEY);
    delete all[planId];
    localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  } catch (_) {}
}

// ─── Connectivity helper ──────────────────────────────────────────────────────

export function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function getCacheStats() {
  const guides = getCachedGuideList();
  const plans = getCachedPlanList();
  const totalBytes = (() => {
    try {
      return (localStorage.getItem(GUIDES_KEY) || '').length + (localStorage.getItem(PLANS_KEY) || '').length;
    } catch (_) { return 0; }
  })();
  return { guidesCount: guides.length, plansCount: plans.length, estimatedKB: Math.round(totalBytes / 1024) };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function getAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (_) { return {}; }
}