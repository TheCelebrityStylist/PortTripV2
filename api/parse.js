/**
 * /api/parse — Vercel serverless function
 * Parses pasted cruise itinerary text into structured JSON.
 * Upload/OCR is stubbed — only text parsing is active.
 */
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PARSE_SCHEMA = `Extract cruise itinerary data and return ONLY valid JSON:
{
  "confidence": "high|medium|low",
  "parserNotes": "brief note on what was found",
  "uncertainFields": ["field1", "field2"],
  "cruise": {
    "name": "auto-generated friendly name e.g. 'MSC Med 2025'",
    "cruise_line": "string or null",
    "ship_name": "string or null",
    "home_port": "embarkation city or null",
    "departure_date": "YYYY-MM-DD or null",
    "return_date": "YYYY-MM-DD or null"
  },
  "ports": [
    {
      "city": "port city name (use full names: 'Santorini' not 'thira')",
      "date": "YYYY-MM-DD or null",
      "all_aboard_time": "HH:MM (default 17:00 if not found)",
      "tender": false,
      "confidence": "high|medium|low"
    }
  ]
}

Rules:
- Exclude embarkation/disembarkation home ports from ports array
- Convert relative dates (Day 1, Day 2) to real dates using departure_date
- If all-aboard time is not mentioned, use 17:00 as default
- Set tender=true for known tender ports: Santorini, Mykonos, Kotor, Portofino
- If ship name is mentioned, generate cruise name as "[Ship] [Month] [Year]"
- Mark uncertainFields for any date/time you guessed or defaulted`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, stub } = req.body;

    // Upload/OCR stub — not yet implemented
    if (stub === 'upload') {
      return res.status(200).json({
        success: false,
        stub: true,
        message: 'File upload parsing is coming soon. Please paste your itinerary text instead.',
      });
    }

    if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a cruise itinerary parser. Extract structured data from cruise booking confirmations, itineraries, and informal descriptions. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Parse this cruise itinerary:\n\n${text.slice(0, 4000)}\n\n${PARSE_SCHEMA}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let result;
    try { result = JSON.parse(raw); } catch {
      return res.status(500).json({ error: 'AI returned invalid JSON' });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('[/api/parse]', error);
    return res.status(500).json({ error: error.message });
  }
}
