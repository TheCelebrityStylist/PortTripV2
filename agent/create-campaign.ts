/**
 * Porttrip Google Ads Campaign Creator
 *
 * Prerequisites:
 *   1. COMPOSIO_API_KEY set in .env
 *   2. ANTHROPIC_API_KEY set in .env
 *   3. Google Ads account connected in Composio dashboard
 *      → https://app.composio.dev → Toolkits → Google Ads → Connect
 *   4. GOOGLE_ADS_CUSTOMER_ID set in .env (10-digit, no dashes)
 *
 * Run: npm run campaign
 */

import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { Composio } from "@composio/core";

const COMPOSIO_USER_ID = "user_85tnt";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID ?? "";
const PRICING_URL = process.env.PRICING_URL ?? "https://www.porttrip.com/pricing";
const HOW_URL = process.env.HOW_URL ?? "https://www.porttrip.com/how-it-works";
const AGENTS_URL = process.env.AGENTS_URL ?? "https://www.porttrip.com/for-agents";
const SAMPLE_URL = process.env.SAMPLE_URL ?? "https://www.porttrip.com/sample-itinerary";
const DEMO_URL = process.env.DEMO_URL ?? "https://www.porttrip.com/demo";
const FAQ_URL = process.env.FAQ_URL ?? "https://www.porttrip.com/faq";

if (!CUSTOMER_ID) {
  console.error(
    "Error: GOOGLE_ADS_CUSTOMER_ID is not set in .env\n" +
    "Find it in your Google Ads account → top-right corner (format: 123-456-7890, enter without dashes)."
  );
  process.exit(1);
}

const composio = new Composio();
const session = await composio.create(COMPOSIO_USER_ID);

const CAMPAIGN_PROMPT = `
You are a Google Ads campaign builder. Use the Google Ads tools available via Composio to create the following campaign EXACTLY as specified. Create everything in PAUSED state — do NOT activate anything.

Google Ads Customer ID: ${CUSTOMER_ID}

=== CAMPAIGN SETTINGS ===
Name: PT_Search_EU_EN_Subscription_2026Q2
Type: SEARCH
Status: PAUSED
Daily budget: 14.00 EUR
Delivery: STANDARD (not accelerated)
Bid strategy: MAXIMIZE_CONVERSIONS (no target CPA)
Networks: Google Search ONLY — disable Search Partners AND Display Network
Locations: European Union — targeting type PRESENCE (people IN the EU)
Languages: English
Ad rotation: OPTIMIZE (prefer best-performing ads)
Ad schedule: All days, 24/7
Final URL expansion: OFF
Dynamic Search Ads: OFF
Tracking template: {lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}&matchtype={matchtype}&device={device}

=== CONVERSION GOAL ===
Primary conversion action name: Porttrip Paid Subscription
(Create this conversion action if it does not exist: Category = PURCHASE, Value = 350 EUR, Count = ONE, Click window = 30 days, Attribution = DATA_DRIVEN)

=== CAMPAIGN-LEVEL NEGATIVE KEYWORDS ===
Add ALL of the following as NEGATIVE PHRASE match keywords at campaign level:

Job/career: jobs, job, hiring, salary, career, careers, employment, vacancy, vacancies, recruit, recruiter, intern, internship
Free/cheap: free, freebie, freeware, no cost, zero cost, cheap, cheapest, discount, coupon, promo code, bargain, low cost, affordable
Information: meaning, definition, define, what is, wikipedia, wiki, pdf, ebook, template, example, examples
Social platforms: youtube, tiktok, instagram, reddit, pinterest, facebook, twitter
Negative sentiment: crash, sinking, capsized, accident, disaster, emergency, lawsuit, sued, scam, fraud, complaint, complaints, warning, death, dead, died, killed, norovirus, outbreak
Off-topic cruise: cake, cakes, model, decorations, costume, costumes, party, theme, coloring, drawing, sketch, toy, toys, lego, game, games, online game, movie, movies, film, films, netflix, hulu, song, songs, lyrics, novel, amazon, ebay, tom cruise, cruise control, cruiser bike, cruise missile, river cruise
Cruise brands: carnival, royal caribbean, msc, ncl, norwegian cruise, virgin voyages, princess cruises, holland america, viking, celebrity cruises, disney cruise
Non-EU geographies: caribbean booking, alaska cruise booking, mexico cruise

=== AD GROUPS & KEYWORDS ===

--- AD GROUP 1: AG1 — AI Cruise Planner ---
Final URL: ${PRICING_URL}
PHRASE match keywords:
"ai cruise planner"
"ai cruise planning"
"cruise planner ai"
"ai itinerary cruise"
"ai for cruise booking"
"smart cruise planner"
"automated cruise planning"
"cruise planning software"
"cruise planning tool"
"online cruise planner"
EXACT match keywords:
[ai cruise planner]
[cruise planning software]

--- AD GROUP 2: AG2 — Cruise Itinerary Builder ---
Final URL: ${PRICING_URL}
PHRASE match keywords:
"cruise itinerary builder"
"cruise itinerary planner"
"build cruise itinerary"
"cruise route planner"
"cruise port planner"
"cruise excursion planner"
"multi port cruise planner"
"design my cruise"
"customise cruise itinerary"
EXACT match keywords:
[cruise itinerary planner]
[cruise itinerary builder]

--- AD GROUP 3: AG3 — Travel Agent Cruise Tools ---
Final URL: ${PRICING_URL}
PHRASE match keywords:
"cruise booking software for travel agents"
"cruise software for agents"
"travel agent cruise tool"
"cruise quoting software"
"cruise crm"
"cruise sales software"
"cruise tools for agencies"
"cruise specialist software"
"cruise consortia tool"
"cruise booking platform agents"
EXACT match keywords:
[cruise crm]
[cruise booking software]

--- AD GROUP 4: AG4 — Plan a Cruise ---
Final URL: ${PRICING_URL}
PHRASE match keywords (NO exact match for this group):
"plan a cruise"
"plan my cruise"
"how to plan a cruise"
"plan cruise online"
"organise a cruise"
"design a cruise trip"

=== RESPONSIVE SEARCH ADS ===

--- RSA for AG1 — AI Cruise Planner ---
Final URL: ${PRICING_URL}
Display path: /ai-cruise/planner
Headlines (pin none):
AI Cruise Planner for Pros
Plan Cruises in Minutes
Cruise Itinerary, Reinvented
From Brief to Itinerary Fast
Smarter Cruise Planning
Built by Cruise Specialists
End the Spreadsheet Era
AI-Powered Itineraries
Quote Cruises 10x Faster
Custom Cruises, Faster
For Travel Pros & Cruisers
Try Porttrip Today
AI That Knows Cruises
Match Clients to Ships
Stop Juggling 12 Tabs
Descriptions:
AI builds tailored cruise itineraries in minutes. Match clients to ships, fast.
From discovery to full quote in one tool. Built for cruise specialists who scale.
Stop juggling brochures and spreadsheets. One AI workspace for every cruise.
Trusted by cruise pros across Europe. Plans, ports, pricing — handled in one place.

--- RSA for AG2 — Cruise Itinerary Builder ---
Final URL: ${PRICING_URL}
Display path: /itinerary/builder
Headlines (pin none):
Cruise Itinerary Builder
Plan Every Port of Call
Smart Cruise Itineraries
Custom Cruises, Built Fast
Match Ports to Travelers
Your Cruise, Optimized
Plan a Cruise Online
Cruise Routes, Reimagined
Multi-Port AI Planner
From Idea to Itinerary
Smarter Than a Brochure
Try the AI Cruise Tool
Find the Perfect Cruise
Built for Cruise Lovers
AI Cruise Planner Online
Descriptions:
AI maps every port, ship and excursion to your goals. Plan smarter cruises, faster.
Tell us your ideal cruise. AI returns a full itinerary, costed and ready to book.
Routes, ships, ports, prices — all in one AI workspace. Try Porttrip today.
From open ocean to dream port — let AI plan it. Pricing from €300/month.

--- RSA for AG3 — Travel Agent Cruise Tools ---
Final URL: ${PRICING_URL}
Display path: /for-agents/cruise-crm
Headlines (pin none):
Cruise Tools for Agents
Win More Cruise Bookings
Agent-Built Cruise CRM
Quote Faster, Close More
Cruise Planning, Automated
10x Your Cruise Output
Built for Travel Agents
AI for Cruise Specialists
Beat the Brochure Era
Itineraries Clients Love
From Lead to Booking, Fast
Save 10 Hours per Cruise
Cruise Quotes in Minutes
Try Porttrip Today
AI That Earns Its Keep
Descriptions:
Stop losing cruise bookings to slow quotes. AI does the heavy lifting in minutes.
Quote, customize and send detailed cruise itineraries before competitors reply.
Built for agents who close cruises. Pricing from €300/month. See plans inside.
From client brief to polished proposal — one workflow, fully AI-assisted.

--- RSA for AG4 — Plan a Cruise ---
Final URL: ${PRICING_URL}
Display path: /plan-a/cruise
Headlines (pin none):
Plan a Cruise with AI
Plan a Cruise Online
From Idea to Cruise Plan
Custom Cruises, Built Fast
AI Cruise Planner Online
Smarter Than a Brochure
Plan Cruises in Minutes
AI-Powered Cruise Plans
Try the AI Cruise Tool
Cruise Planning Reinvented
Match Travelers to Ships
Personalized Cruise Plans
Your AI Cruise Concierge
Built by Cruise Specialists
End Cruise Planning Pain
Descriptions:
Tell our AI your dream cruise — get a full plan, costed and ready, in minutes.
Skip the spreadsheets. Porttrip's AI builds personalized cruise itineraries.
Routes, ports, ships, prices — handled. Built for serious cruise planners.
Trusted by cruise pros across Europe. Plans clients love, in a fraction of the time.

=== AD ASSETS (account-level) ===

SITELINKS:
1. Text: "Pricing & Plans" | Desc1: "See plans from €300/mo" | Desc2: "Find your fit" | URL: ${PRICING_URL}
2. Text: "How It Works" | Desc1: "From brief to booking" | Desc2: "AI does the planning" | URL: ${HOW_URL}
3. Text: "For Travel Agents" | Desc1: "Built for cruise pros" | Desc2: "Save 10 hrs per cruise" | URL: ${AGENTS_URL}
4. Text: "Sample Itinerary" | Desc1: "Try a real AI plan" | Desc2: "Free preview, no signup" | URL: ${SAMPLE_URL}
5. Text: "Book a Demo" | Desc1: "Live walkthrough, 15 min" | Desc2: "See it for your clients" | URL: ${DEMO_URL}
6. Text: "FAQ" | Desc1: "Common questions answered" | Desc2: "Pricing, AI, support" | URL: ${FAQ_URL}

CALLOUTS:
AI-built itineraries
Trusted by EU cruise pros
Cancel anytime
14-day free trial
From €300/month
Built by cruise pros
Multi-language ready
Email support included

STRUCTURED SNIPPETS — Type: Services:
Itinerary planning
Port matching
Quote generation
Client proposals
AI recommendations
CRM integration

=== FINAL INSTRUCTIONS ===
1. Create ALL of the above in PAUSED state.
2. After creating, output a structured summary in this format:
   - Campaign ID
   - Ad group IDs (one per group)
   - Number of keywords added per ad group
   - Number of negative keywords added
   - RSA IDs
   - Asset IDs (sitelinks, callouts, snippets)
   - Any items that could NOT be created and why
3. Do NOT activate the campaign. Final status must be PAUSED.
`;

console.log("Connecting to Composio session...");
console.log(`User: ${COMPOSIO_USER_ID} | Customer ID: ${CUSTOMER_ID}\n`);

const stream = await query({
  prompt: CAMPAIGN_PROMPT,
  options: {
    permissionMode: "bypassPermissions",
    mcpServers: {
      composio: session.mcp,
    },
  },
});

for await (const event of stream) {
  if (event.type === "assistant" && event.message?.content) {
    for (const block of event.message.content) {
      if (block.type === "text") process.stdout.write(block.text);
    }
  }
  if (event.type === "result" && event.subtype === "success") {
    process.stdout.write("\n\n=== AGENT COMPLETED ===\n");
    process.stdout.write(event.result + "\n");
  }
  if (event.type === "result" && event.subtype === "error_max_turns") {
    console.error("\nAgent hit max turns — campaign may be partially created. Check Google Ads UI.");
  }
}
