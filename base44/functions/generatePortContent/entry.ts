import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

function buildGuidePrompt1(city, country, region) {
  return `You are writing premium cruise port intelligence for ${city}, ${country || region || ''}. This is a paid concierge product. Every sentence must earn its place — no filler, no blog padding, no vague generics.

QUALITY STANDARD: A first-time cruise passenger should read this and feel: "This saves me time, money, and mistakes."

STRICT RULES:
- Every transport option: exact cost EUR, exact minutes, exact departure point
- Every restaurant: real name, specific dish, price range per person
- Every attraction: entry price, best arrival time, how long to spend
- No phrases like "you can" or "there are" — only declarative facts
- Costs in EUR (or local with EUR equivalent)
- What to SKIP and exactly why

Return ONLY valid JSON:
{
  "description": "HOOK: One sentence that captures what makes ${city} uniquely worth a cruise stop. Then: what most passengers waste their time on vs what they should actually do. The one thing not to miss. The one thing to skip completely. Cruise-specific context (tender or dock, distance to city centre). Max 220 words.",
  "attraction_highlights": "THE PERFECT DAY — executable timeline. Format each step exactly: HH:MM — [Action] | [Transport mode, €X, Ymin] | [Specific what-to-do + insider trick]. Start 08:30 from pier. Include: best photo spot (exact location + best time for light), best lunch (restaurant name, dish, price), one iconic sight, one surprise locals know. End: Leave [place] by [time] — [transport] back — pier by [time] — [N]min safety buffer. Total: €XX per person.",
  "local_food": "5 specific places — not categories. Each: Name (bold). What to order: specific dish name. Price: €X–Y per person. Distance from port: Xmin by [mode]. Why locals go here. ONE tourist trap near the port to avoid by name.",
  "transport_port_to_city": "TAXI: Rank is [exact location — e.g. 'turn right at gangway exit, 50m, yellow sign']. Price: €X–Y. Time: Ymin. Tip: [one specific tip].\nBUS: Line [number]. Stop: [exact location]. Fare: €X. Frequency: every Xmin. Journey: Xmin.\nWALK: [X]m, [Y]min. Flat/hilly. Worth it for: [who].\nBEST OPTION: [mode] because [one sentence reason].",
  "transport_within_city": "Metro line numbers + stops. Most useful bus routes + numbers. Taxi apps or company names + typical city fare. E-scooter availability + app name. One money-saving trick most passengers don't know.",
  "transport_day_trips": "Exactly 2 day trips worth leaving the city for. Each: departure from pier (exact transport + cost + time), what to do, realistic time needed, ship excursion equivalent price + your DIY saving. Only include if doable in 6–8 hours total.",
  "unique_experiences": "5 things 95% of cruise tourists miss. Format: [Title]: [What it is + exact directions/instructions]. Must include: one free experience, one food secret, one viewpoint only locals know, one timing trick (specific time to avoid crowds at specific site), one neighbourhood to wander.",
  "safety_security": "Risk level: X/10. Areas to avoid: [specific street/district + reason]. 3 scams targeting cruise passengers in ${city}: [Scam name]: [how it works] → [exactly how to avoid]. Emergency number: [X]. Nearest hospital to port: [name + distance].",
  "local_customs": "Only what affects today. Dress codes: [which specific sites require what]. Tipping: restaurants [X]%, taxis [X]%. 2 key phrases: [word] = [phonetic] = [meaning]. Photography rules at main sites.",
  "weather": "Month-by-month temperature (°C) and rain likelihood in one line each. Items to pack specific to ${city}. The one weather trap cruise passengers fall for here.",
  "port_description": "Terminal: [T1/T2/name]. ATM: [exact location]. Wi-Fi: [yes/no, where]. Taxi rank: [exact location]. Luggage storage: [yes/no, cost]. Distance to city centre: [Xm, Ymin walk/taxi].",
  "beyond_highlights": "For repeat visitors only. 3 things the ship excursion would never take you to: hidden neighbourhood, unusual museum or site, local market or event with timing."
}`;
}

function buildGuidePrompt2(city, country, region) {
  return `You are writing premium cruise day itineraries for ${city}, ${country || region || ''}. Each must be executable by a cruise passenger with zero local knowledge.

MANDATORY FORMAT for every itinerary:
- Every step: [TIME] — [ACTION] ([TRANSPORT MODE], €[COST], [DURATION])
- Every stop: specific name + exact what to do + duration + cost + one insider tip
- Total budget at top
- RETURN PLAN: exact time to leave, transport, arrival time at pier, minutes before all-aboard
- SKIP WARNING: one overrated nearby thing and why
- BACKUP PLAN: 'If running late: skip [X], take [transport] directly to pier — €[cost], [duration]min'

Return ONLY valid JSON:
{
  "itinerary_first_time": "HOOK: 'First time in ${city}? This is your perfect day.' Total budget: €XX per person. Full timeline 08:30–[safe return]. Every step timestamped. Include: best photo spot (exact + best light time), best lunch (name + what to order + price), the one iconic thing, one surprise. End: Leave [place] at [time], [transport] to pier, arrive [time] — [N]min before all-aboard. SKIP: [thing] — not worth it because [reason]. BACKUP: if behind, skip [X] and [Y], taxi directly, still make it.",
  "itinerary_nature": "For outdoors and scenery lovers. Full timestamped timeline. Every stop: exact location, how to get there, what to see, difficulty, duration. Best viewpoint (specific name + how to reach). Water activity if applicable. Realistic for average fitness. Total budget. Return plan. Backup plan.",
  "itinerary_history": "For history lovers. Chronological journey. Specific museums: opening time, entry cost, skip-the-line trick, what NOT to miss inside. Ruins/monuments: access, cost, how long. Order: most important first. Full timestamped timeline. Total budget. Return plan. Backup plan.",
  "itinerary_relaxation": "Slow, stress-free day. Best café with view (name + what to order). Harbour walk route (start + end + duration). Market browse (name + opening + what to look for). Afternoon aperitivo spot (name + best drink + price). Full timeline. Backup: if anywhere closed, go to [alternative].",
  "itinerary_culture": "Culture seekers. Local neighbourhood not on ship excursion (name + how to reach + what street). Authentic restaurant (name + dish + price). Cultural site (name + significance + cost + dress code). Craft market or gallery (name + what worth buying). Full timestamped timeline. Total budget. Return plan.",
  "excursion_1_title": "Best DIY excursion from ${city} — max 5 words",
  "excursion_1_description": "Ship tour price: €[X]. DIY cost: €[Y]. Save: €[Z]. Departure: [exact transport from pier + cost + time]. Journey: [X]min. What to do: [activities + costs]. Return: [transport + cost + time]. Total: €[X]/person.",
  "excursion_2_title": "Second best DIY excursion",
  "excursion_2_description": "Same format as excursion 1.",
  "excursion_3_title": "Third DIY excursion",
  "excursion_3_description": "Same format as excursion 1."
}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { port_id, city, overwrite } = await req.json();
    if (!port_id && !city) return Response.json({ error: 'port_id or city required' }, { status: 400 });

    let port;
    if (port_id) {
      const ports = await base44.asServiceRole.entities.CruisePort.filter({ id: port_id });
      port = ports[0];
    } else {
      const ports = await base44.asServiceRole.entities.CruisePort.filter({ city });
      port = ports[0];
    }

    if (!port) return Response.json({ error: `Port not found: ${city || port_id}` }, { status: 404 });

    if (!overwrite && port.description && port.description.length > 200) {
      return Response.json({ skipped: true, city: port.city, message: 'Already has content' });
    }

    const schema1Props = {
      description: { type: 'string' }, attraction_highlights: { type: 'string' },
      local_food: { type: 'string' }, transport_port_to_city: { type: 'string' },
      transport_within_city: { type: 'string' }, transport_day_trips: { type: 'string' },
      unique_experiences: { type: 'string' }, safety_security: { type: 'string' },
      local_customs: { type: 'string' }, weather: { type: 'string' },
      port_description: { type: 'string' }, beyond_highlights: { type: 'string' },
    };

    const schema2Props = {
      itinerary_first_time: { type: 'string' }, itinerary_nature: { type: 'string' },
      itinerary_history: { type: 'string' }, itinerary_relaxation: { type: 'string' },
      itinerary_culture: { type: 'string' },
      excursion_1_title: { type: 'string' }, excursion_1_description: { type: 'string' },
      excursion_2_title: { type: 'string' }, excursion_2_description: { type: 'string' },
      excursion_3_title: { type: 'string' }, excursion_3_description: { type: 'string' },
    };

    // Run both prompts in parallel using OpenAI with JSON mode
    const [res1, res2] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a premium cruise travel intelligence writer. Output only valid JSON.' },
          { role: 'user', content: buildGuidePrompt1(port.city, port.country_code, port.region) },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.6,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a premium cruise excursion planner. Output only valid JSON.' },
          { role: 'user', content: buildGuidePrompt2(port.city, port.country_code, port.region) },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.6,
      }),
    ]);

    const part1 = JSON.parse(res1.choices[0].message.content);
    const part2 = JSON.parse(res2.choices[0].message.content);
    const content = { ...part1, ...part2 };

    await base44.asServiceRole.entities.CruisePort.update(port.id, {
      ...content,
      avg_ship_excursion_price: port.avg_ship_excursion_price || 119,
      avg_diy_cost: port.avg_diy_cost || 35,
    });

    return Response.json({ success: true, city: port.city, contentLength: JSON.stringify(content).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});