import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

function calcSafeReturn(allAboardTime, bufferMins, tenderMins) {
  if (!allAboardTime) return 'unknown';
  const [h, m] = allAboardTime.split(':').map(Number);
  const total = h * 60 + m - (bufferMins || 90) - (tenderMins || 0);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

const SYSTEM_CHAT = `You are PortTrip — a private shore excursion concierge. You have personally done every route, know every scam, and are trusted by thousands of cruise passengers to save them time, money, and stress.

RULES:
- Every transport leg: exact line number, cost in EUR, duration in minutes, exact departure point
- Every stop: name, what to do, duration, cost, why it beats the ship tour equivalent
- Be opinionated: name what to skip and exactly why
- NEVER say "you can take a bus" — say "Bus 14 from Pier 2, €2.40, 8 min, runs every 10 min"
- Every plan must include a BACKUP PLAN if running late
- Always warn about ship departure risk

When you suggest stops, output structured JSON wrapped in <itinerary></itinerary>:
{
  "stops": [
    {
      "block_type": "arrival|stop|transit|buffer|departure",
      "title": "",
      "subtitle": "",
      "location": "",
      "duration_minutes": 0,
      "transport_mode": "walk|bus|taxi|train|ferry",
      "cost_estimate": 0,
      "notes": "",
      "insider_tip": "",
      "google_maps_query": "",
      "walking_distance_from_prev_m": 0
    }
  ],
  "total_cost_estimate": 0,
  "backup_plan": "",
  "return_strategy": "",
  "vs_ship_tour": ""
}`;

const SYSTEM_PACKING = `You are a cruise packing specialist. Every item must be specific to THIS port and TODAY's plan — no generic advice.
Output wrapped in <packing></packing>:
{ "categories": [{ "name": "string", "emoji": "string", "items": [{ "item": "string", "essential": true, "reason": "string" }] }] }
Categories: Documents and Money, Clothing, Footwear, Sun and Heat, Tech and Navigation, Health and Safety, Activity-specific, Food and Drinks.`;

const SYSTEM_TRANSPORT = `You are a cruise port transport expert. Give passengers exact, reliable transport data.
NEVER say "you can take a bus" — say "Bus 14 from Pier 2, €2.40, runs every 10 min, stop is 50m from gangway".
Rank: best for speed, best for cost, best for groups of 2+.
Always include return_strategy — the single safest route back to the ship.
Output wrapped in <transport></transport>:
{ "options": [{ "mode": "bus|taxi|train|walk|ferry|rideshare", "name": "", "from": "", "to": "", "duration_minutes": 0, "cost_estimate": 0, "cost_range": "", "frequency": "", "all_aboard_safe": true, "tips": "", "exact_stop": "" }], "warnings": ["string"], "pro_tip": "string", "return_strategy": "string" }`;

function buildAutogenPrompt(plan, portGuideContext) {
  const port = plan?.port_city || 'this port';
  const dockTime = plan?.dock_time || '08:00';
  const allAboard = plan?.all_aboard_time || '17:00';
  const isTender = (plan?.tender_delay_minutes || 0) > 0;
  const bufferMins = isTender ? 105 : (plan?.buffer_minutes || 90);
  const safeReturn = calcSafeReturn(allAboard, bufferMins, 0);
  const diyBudget = plan?.diy_budget || 50;
  const shipPrice = plan?.ship_excursion_price || 119;
  const portData = portGuideContext || 'Use your expert knowledge of this port.';
  const prefs = [
    plan?.travel_mode && `Style: ${plan.travel_mode}`,
    plan?.group_type && `Group: ${plan.group_type}`,
    plan?.budget_mode && `Budget: ${plan.budget_mode}`,
  ].filter(Boolean).join(' | ');

  return `You are a private shore excursion concierge creating a premium day plan for a cruise passenger.

PORT: ${port}
DOCK TIME: ${dockTime} | ALL ABOARD: ${allAboard} | MUST BE AT PIER BY: ${safeReturn}
TENDER PORT: ${isTender ? 'YES — add 30min each way' : 'No'}
BUFFER: ${bufferMins}min | PREFERENCES: ${prefs || 'first time, couple, mid-range'}
DIY BUDGET: €${diyBudget}/person | SHIP EXCURSION TO BEAT: €${shipPrice}/person

PORT INTELLIGENCE (use this as primary data):
${portData}

YOUR TASK: Create the best possible day for this passenger. Not a blog post. A private concierge briefing.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## YOUR DAY IN ${port.toUpperCase()}
Total available time: [dock time] → [safeReturn] ([X] hours [Y] min)
Target spend: €${diyBudget}/person | Saving vs ship tour: ~€${shipPrice - diyBudget}/person

---
### TIMELINE
${dockTime} — Disembark
[TIME] — [Transport to first stop] ([exact mode], €[cost], [X]min, [exact departure point])
[TIME]–[TIME] — **[Stop Name]** | [duration]min | €[cost]
  → What to do: [specific action, not vague]
  → Insider tip: [one thing 95% of tourists miss]
  → Skip this if: [condition]

[Continue every step in this exact format]

---
### RETURN STRATEGY
Leave **[last stop]** at **[time]**
[Exact transport mode + route + cost + duration]
Arrive at pier: **[time]** — [N]min before all-aboard ✓

---
### BACKUP PLAN
If running 30min late:
→ Skip [X] — save [Y]min
→ Take [exact transport] directly from [location] — €[cost], [duration]
→ Still make it: [confirm time]

---
### COST BREAKDOWN
| Item | Cost/person |
|------|-------------|
[list every item]
**Total: €[X]/person**
Ship excursion: €${shipPrice} → You save: **€${shipPrice - diyBudget}/person**

---

Then output machine-readable data in <itinerary></itinerary>:
{
  "stops": [
    {
      "block_type": "arrival|stop|transit|buffer|departure",
      "title": "",
      "subtitle": "",
      "location": "",
      "duration_minutes": 0,
      "transport_mode": "walk|bus|taxi|train|ferry",
      "cost_estimate": 0,
      "notes": "",
      "insider_tip": "",
      "google_maps_query": "",
      "walking_distance_from_prev_m": 0
    }
  ],
  "total_cost_estimate": 0,
  "backup_plan": "",
  "return_strategy": "",
  "vs_ship_tour": "Save €${shipPrice - diyBudget}/person vs ship excursion"
}

Be hyper-specific. Real names. Real prices. Real times. If it could apply to any port, rewrite it.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { mode, messages, plan, context } = await req.json();

    const systemMap = { chat: SYSTEM_CHAT, packing: SYSTEM_PACKING, transport: SYSTEM_TRANSPORT };

    let systemPrompt, userPrompt;

    if (mode === 'autogen') {
      systemPrompt = 'You are a premium cruise excursion planner. Follow the format exactly as instructed. No generic filler.';
      userPrompt = buildAutogenPrompt(plan, context);
    } else {
      systemPrompt = systemMap[mode] || SYSTEM_CHAT;
      const safeReturn = calcSafeReturn(plan?.all_aboard_time, plan?.buffer_minutes, plan?.tender_delay_minutes);
      const cruiseCtx = plan ? `\n\nCRUISE CONTEXT:\nPort: ${plan.port_city || 'unknown'}\nAll-aboard: ${plan.all_aboard_time || '17:00'} (HARD deadline)\nMust be at pier by: ${safeReturn}\nBuffer: ${(plan.buffer_minutes || 90)}min + tender: ${plan.tender_delay_minutes || 0}min\nTravel style: ${plan.travel_mode || 'first_time'}, ${plan.group_type || 'couple'}, ${plan.budget_mode || 'mid_range'}\nDIY budget: €${plan.diy_budget || 50}/person\nShip excursion to beat: €${plan.ship_excursion_price || 119}\nCurrent stops in plan: ${plan.current_stops || 'none yet'}` : '';

      const history = (messages || []).slice(-8).map(m => ({ role: m.role, content: m.content }));
      const lastUser = history[history.length - 1];
      userPrompt = (lastUser?.content || '') + cruiseCtx;
      if (context) userPrompt += `\n\nPORT INTELLIGENCE:\n${context}`;
    }

    const chatMessages = [{ role: 'system', content: systemPrompt }];
    if (mode !== 'autogen') {
      const history = (messages || []).slice(-8).slice(0, -1);
      for (const m of history) chatMessages.push({ role: m.role, content: m.content });
    }
    chatMessages.push({ role: 'user', content: userPrompt });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: chatMessages,
      max_tokens: 4000,
      temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content || '';

    let itinerary = null, packing = null, transport = null;

    const itinMatch = rawContent.match(/<itinerary>([\s\S]*?)<\/itinerary>/);
    if (itinMatch) { try { itinerary = JSON.parse(itinMatch[1]); } catch (_) {} }
    const packMatch = rawContent.match(/<packing>([\s\S]*?)<\/packing>/);
    if (packMatch) { try { packing = JSON.parse(packMatch[1]); } catch (_) {} }
    const transMatch = rawContent.match(/<transport>([\s\S]*?)<\/transport>/);
    if (transMatch) { try { transport = JSON.parse(transMatch[1]); } catch (_) {} }

    const cleanContent = rawContent
      .replace(/<itinerary>[\s\S]*?<\/itinerary>/g, '')
      .replace(/<packing>[\s\S]*?<\/packing>/g, '')
      .replace(/<transport>[\s\S]*?<\/transport>/g, '')
      .trim();

    return Response.json({ content: cleanContent, itinerary, packing, transport });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});