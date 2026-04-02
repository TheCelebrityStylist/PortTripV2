import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const { portContext, existingSummary, userPrompt } = await req.json();

    const systemPrompt = `You are PortTrip — a cruise intelligence system purpose-built for cruise passengers.
You generate optimized port day itineraries that are:
- Return-to-ship safe (respect buffer times and tender delays)
- Budget-smart (DIY routes significantly cheaper than ship excursions)
- Personalized for the traveler's style and group type
- Realistic in timing with walking distances considered

Always output valid JSON with a "suggestions" array. Each suggestion:
{
  "block_type": "stop" | "transit" | "buffer" | "arrival" | "departure",
  "title": "string",
  "subtitle": "string",
  "location": "string",
  "duration_minutes": number,
  "transport_mode": "walk" | "drive" | "train" | "bus" | "taxi" | "",
  "cost_estimate": number,
  "notes": "string"
}

Generate 5-8 stops for a full port day. Make it practical, specific, and safe.`;

    const userMessage = `${portContext || ''}

${existingSummary ? `Existing itinerary stops:\n${existingSummary}\n` : ''}
User request: ${userPrompt || 'Build me an optimized port day itinerary'}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return Response.json({ suggestions: parsed.suggestions || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});