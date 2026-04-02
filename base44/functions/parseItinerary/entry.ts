import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

const SYSTEM = `You are a cruise itinerary parser. Extract structured data from booking confirmations, itinerary text, emails, or pasted schedules.

Return ONLY valid JSON with this exact structure:
{
  "confidence": "high|medium|low",
  "cruise": {
    "name": "string or null",
    "cruise_line": "string or null",
    "ship_name": "string or null",
    "home_port": "string or null",
    "departure_date": "YYYY-MM-DD or null",
    "return_date": "YYYY-MM-DD or null",
    "cabin_number": "string or null",
    "booking_reference": "string or null"
  },
  "ports": [
    {
      "city": "string — normalized port city name",
      "raw": "string — exactly as found in text",
      "date": "YYYY-MM-DD or null",
      "all_aboard_time": "HH:MM or null",
      "tender": false,
      "confidence": "high|medium|low",
      "notes": "string or null — any relevant context"
    }
  ],
  "uncertainFields": ["list of field names that need user confirmation"],
  "parserNotes": "string — brief explanation of what was found and what was inferred"
}

RULES:
- Normalize port names: 'Rome' → 'Civitavecchia (Rome)', 'Athens' → 'Piraeus (Athens)', 'Florence' → 'Livorno (Florence)'
- If all-aboard time is missing, default to '17:00' and mark as low confidence
- Include embarkation/debarkation port only as home_port, NOT as a port stop
- Sort ports chronologically
- If you see 'tender' or 'anchor' mentioned near a port, mark tender: true
- If a date is ambiguous (e.g. '14 Jun' with no year), infer year from context or departure_date`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, fileUrl, fileType } = await req.json();
    if (!text && !fileUrl) return Response.json({ error: 'text or fileUrl required' }, { status: 400 });

    let content = text || '';

    // If file URL provided, fetch and use as image/text
    if (fileUrl && !content) {
      const fileRes = await fetch(fileUrl);
      const contentType = fileRes.headers.get('content-type') || '';
      if (contentType.includes('text') || contentType.includes('csv') || fileType === 'txt' || fileType === 'csv') {
        content = await fileRes.text();
      } else {
        // image or PDF — use vision
        const messages = [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the cruise itinerary from this document/image.' },
              { type: 'image_url', image_url: { url: fileUrl } }
            ]
          }
        ];
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          response_format: { type: 'json_object' },
          max_tokens: 2000,
        });
        const parsed = JSON.parse(res.choices[0].message.content || '{}');
        return Response.json({ success: true, result: parsed });
      }
    }

    if (!content?.trim()) return Response.json({ error: 'No content to parse' }, { status: 400 });

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Parse this cruise itinerary text:\n\n${content.slice(0, 6000)}` }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.1,
    });

    const parsed = JSON.parse(res.choices[0].message.content || '{}');
    return Response.json({ success: true, result: parsed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});