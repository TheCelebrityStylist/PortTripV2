/**
 * /api/planner — Vercel serverless function (Node.js)
 * Replaces the Base44 plannerEngine Deno function.
 * Uses OPENAI_API_KEY from Vercel environment variables.
 */
import OpenAI from 'openai';
import { PORT_REGISTRY, resolvePort as resolveRegistryPort } from '../utils/portRegistry.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Adapt portRegistry.js format to the prompt builder format ─────────────
function adaptEntry(entry) {
  if (!entry) return null;
  const toGems = (arr = []) => arr.map(g =>
    typeof g === 'string'
      ? { name: g.split(' — ')[0].split(':')[0].trim().slice(0, 50), instruction: g }
      : { name: g.name || '', instruction: g.instruction || g.name || '' }
  );

  return {
    displayName: entry.displayName,
    country: entry.country,
    portType: entry.portType || 'dock',
    tenderMin: entry.tenderMinDefault || 0,
    defaultBuffer: entry.defaultBufferMin || 90,
    portToCity: [{
      mode: (entry.defaultTransport || ['taxi'])[0],
      label: 'Port → City',
      instruction: entry.transferNotes || '',
      duration: 20, cost: 10, note: '',
    }],
    areas: [...new Set((entry.attractions || []).map(a => a.area).filter(Boolean))].slice(0, 6),
    attractions: (entry.attractions || []).map(a => ({
      name: a.name, area: a.area || '',
      dur: a.duration || 60, cost: a.cost || 0, score: 85,
      type: a.type || 'culture', why: a.why || '', tip: a.tip || '', trap: false,
    })),
    food: (entry.food || []).map(f => ({
      name: f.name, area: f.area || '', cost: f.cost || 15,
      tip: f.tip || '', meal: f.type || 'meal', price: `~€${f.cost || 15}`,
    })),
    hiddenGems: toGems(entry.hiddenGems),
    traps: entry.touristTraps || entry.traps || [],
    safeReturn: entry.safeReturnNote || entry.safeReturn || '',
    shipVsDiy: entry.shipVsDiy || 99,
    avgDiy: entry.avgDiy || 40,
  };
}

function resolvePort(cityName) {
  const entry = resolveRegistryPort(cityName);
  return entry ? adaptEntry(entry) : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcMustLeave(allAboardTime, bufferMins, tenderMins) {
  if (!allAboardTime) return null;
  const [h, m] = allAboardTime.split(':').map(Number);
  const mins = h * 60 + m - (bufferMins || 90) - (tenderMins || 0);
  if (mins < 0) return '00:00';
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

// ─── Journey schema ───────────────────────────────────────────────────────────
const JOURNEY_SCHEMA = `Return ONLY valid JSON (no markdown, no code fences):
{
  "planName": "evocative name",
  "summary": "1 compelling sentence why this day is great",
  "variantType": "best_overall|best_value|least_stress|local_vibe|low_walking|max_sights",
  "planScore": 85,
  "scoreBreakdown": { "cruiseSafety": 92, "timeEfficiency": 85, "sightseeingValue": 88, "costEfficiency": 80, "walkingComfort": 75, "routeLogic": 90, "localCharacter": 84, "personalFit": 80 },
  "whyThisPlanWorks": ["string","string","string"],
  "biggestWeakness": "string",
  "fastestImprovement": "string",
  "totalEstimatedCost": 52,
  "savingsVsShipExcursion": 68,
  "totalWalkingMinutes": 38,
  "totalTransportMinutes": 42,
  "recommendedReturnStartTime": "15:30",
  "safeReturnScore": 90,
  "wowMoment": { "title": "string", "why": "string", "bestTiming": "HH:MM", "backup": "string" },
  "emotionalArc": { "calm_start": "string", "wow_peak": "string", "recharge": "string", "final_memory": "string", "wind_down": "string" },
  "conciergeInsights": { "mustPreBook": "string", "skipEntirely": "string", "lunchStrategy": "string", "touristMistake": "string" },
  "nearbyOpportunities": [{ "type": "hidden_gem|better_lunch|cheaper_swap", "title": "string", "description": "string" }],
  "watchOuts": [{ "type": "queue|overrated|bottleneck", "title": "string", "description": "string" }],
  "journey": [
    {
      "id": "j1",
      "type": "arrival|departure|transport|stop|food",
      "mode": "bus|walk|taxi|metro|tram|train|ferry|cable_car",
      "title": "string",
      "subtitle": "string",
      "area": "string",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "durationMin": 0,
      "estimatedCostEur": 0,
      "instruction": "step-by-step (transport only)",
      "whyThisMode": "string (transport only)",
      "alternativeMode": "string or null",
      "stopScore": 0,
      "worthItScore": 0,
      "why": "string (stops only)",
      "insiderTip": "string",
      "touristTrapRisk": "low|medium|high",
      "alternatives": [{"title": "string", "reasonToSwap": "string"}]
    }
  ]
}`;

// ─── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(action, plan, registry) {
  const mustLeave = calcMustLeave(plan.all_aboard_time, plan.buffer_minutes, plan.tender_delay_minutes);
  const isTender = registry?.portType === 'tender' || (plan.tender_delay_minutes || 0) > 0;
  const portName = registry?.displayName || plan.port_city;
  const budget = plan.diy_budget || 60;
  const shipPrice = plan.ship_excursion_price || 0;

  const tenderNote = isTender
    ? `⚠️ TENDER PORT: Add ${plan.tender_delay_minutes || 30}min EACH WAY. Return earlier.`
    : 'Dock port — standard buffer.';

  const portIntel = registry ? `
CITY INTELLIGENCE (${portName}):
Port-to-city: ${registry.portToCity.map(t => `[${t.mode.toUpperCase()}] ${t.label} — ${t.instruction} — ${t.duration}min, €${t.cost}`).join('\n')}

City areas: ${registry.areas.join(' | ') || 'Various districts'}

Top attractions:
${registry.attractions.map(a =>
  `  • ${a.name} (${a.area}, ${a.dur}min, €${a.cost})\n    WHY: ${a.why}\n    TIP: ${a.tip}`
).join('\n')}

Best food:
${registry.food.map(f => `  • ${f.name} (${f.area}) — ${f.tip} — ${f.price}`).join('\n')}

Hidden gems:
${registry.hiddenGems.map(g => `  • ${g.name}: ${g.instruction}`).join('\n')}

Avoid: ${registry.traps.join(' | ')}
Safe return: ${registry.safeReturn}
Ship tour: ~€${registry.shipVsDiy} → DIY target: ~€${registry.avgDiy}` : '';

  const header = `PORT: ${portName}${registry?.country ? ', ' + registry.country : ''}
DOCK: ${plan.dock_time || '08:00'} | ALL ABOARD: ${plan.all_aboard_time} | MUST LEAVE CITY: ${mustLeave}
${tenderNote}
STYLE: ${plan.travel_mode || 'first_time'} / ${plan.group_type || 'couple'} / ${plan.budget_mode || 'mid_range'}
BUDGET: €${budget}/person | SHIP TOUR: €${shipPrice}
${portIntel}`;

  const rules = `
RULES:
1. Every stop MUST be preceded by a transport step. Never two consecutive stops.
2. Use REAL bus numbers, metro lines, street names from the data above.
3. Every transport step: mode, title, instruction (step by step), duration, cost, whyThisMode.
4. Use REAL place names only — never "local restaurant" or "famous cathedral".
5. Include 4–6 stops (excluding arrival/departure).
6. Structure: arrival → transport → stop → transport → stop → ... → transport → return.
7. Lunch must be a named specific restaurant with a specific dish.
8. Safe return score must be ≥ 85.`;

  if (action === 'generate_variants') {
    return `You are a world-class cruise port day planner with deep local knowledge of ${portName}. Generate 3 COMPLETE, MATERIALLY DIFFERENT plan variants.

${header}${rules}

Variant 1 (variantType: "best_overall"): Best highlights + efficient transport + strong route logic
Variant 2 (variantType: "best_value"): Maximum savings — fewer paid entries, public transport, local food
Variant 3 (variantType: "least_stress"): 3–4 stops max, simple route, extra return buffer

Each variant MUST have materially different stops and transport strategy.

Return: { "variants": [ ...3 complete plans... ] }
Each plan must include all schema fields including a full journey array with transport steps.
${JOURNEY_SCHEMA}`;
  }

  const actionPrompts = {
    build_full_itinerary: `Build the best possible DIY day itinerary for ${portName}.`,
    optimize_route: `Optimize this ${portName} itinerary: fix routing inefficiencies, cluster by area, reduce backtracking.`,
    make_cheaper: `Cut costs on this ${portName} itinerary while keeping quality excellent. Target €${budget}/person.`,
    reduce_walking: `Minimize walking on this ${portName} day using transport more aggressively.`,
    local_vibe: `Build a non-tourist, local-focused ${portName} itinerary avoiding obvious cruise stops.`,
    make_safer: `Rebuild this ${portName} itinerary to guarantee safe return with maximum confidence.`,
    add_wow_moment: `Add one emotionally unforgettable moment to this ${portName} day.`,
  };

  return `You are a world-class cruise port day planner with deep local knowledge of ${portName}.
${actionPrompts[action] || actionPrompts.build_full_itinerary}

${header}${rules}
${JOURNEY_SCHEMA}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, plan } = req.body;
    if (!action || !plan) return res.status(400).json({ error: 'action and plan are required' });

    const registry = resolvePort(plan.port_city);
    const prompt = buildPrompt(action, plan, registry);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a precision cruise port day planner. You produce journey-structured itineraries with EXPLICIT transport steps between every stop. Use ONLY real place names, real bus lines, real costs. NEVER skip a transport step. Return ONLY valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 5000,
      temperature: 0.55,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let result;
    try { result = JSON.parse(raw); } catch {
      return res.status(500).json({ error: 'AI returned invalid JSON', raw });
    }

    if (action === 'generate_variants' && result.variants) {
      return res.status(200).json({ success: true, variants: result.variants, port: plan.port_city });
    }

    return res.status(200).json({ success: true, plan: result, action, port: plan.port_city });
  } catch (error) {
    console.error('[/api/planner]', error);
    return res.status(500).json({ error: error.message });
  }
}
