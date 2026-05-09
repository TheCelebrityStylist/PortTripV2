━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 SEO ENGINE — USAGE GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type these into Claude Code. Or just describe what you want naturally.

─── WRITING ─────────────────────────────────────

"Write the next blog"
   → Picks top priority from content-queue, asks for SERP data, drafts, saves as draft.

"Write a blog about [topic]"
   → Checks for cannibalization first, then asks for SERP data, then writes.

"Write a comparison: PortTrip vs [Competitor]"
   → Uses competitor data from competitors.yaml.

"Write the pillar page for [cluster name]"
   → Asks for SERP data first, then writes comprehensive pillar.

"Approve blog [slug]"
   → Marks as published (draft: false) after your review.

"Blog [slug] needs changes: [feedback]"
   → Revises and keeps as draft.

─── SERP RESEARCH ───────────────────────────────

Before every blog, Claude Code needs real SERP data from Google.
It will NOT use its own web search — that gives generic results.

IF dedicated SEO MCP tool connected (Semrush, Ahrefs) → uses that.

OTHERWISE → Claude Code asks YOU to search Google and provide:
   1. Top 3-5 ranking page titles + URLs
   2. People Also Ask questions
   3. Related searches from bottom of Google
   4. Related keywords from your SEO tools (optional)

This ensures blogs are written against real competition, not guesses.

─── CURRENT QUEUE STATUS ────────────────────────

HIGH PRIORITY (write these first):
  q_001 — The Complete Guide to Planning a Cruise Port Day [PILLAR]
  q_002 — DIY Cruise Shore Excursions: The Complete Guide [PILLAR]
  q_003 — The Best AI Tools for Cruise Planning in 2026 [PILLAR]
  q_004 — Mediterranean Cruise Ports: The Complete Guide [PILLAR]
  q_005 — Using ChatGPT to Plan a Cruise Port Day [COMPARISON]
  q_006 — How to Never Miss Your Cruise Ship at Port [HOW-TO]

All pillar pages (q_001–q_004) need SERP data before writing.
Start with q_006 or q_005 if you want a quick first post.

─── NEW DOCS & FEATURES ─────────────────────────

"New feature: [name] — [description]"
   → Adds to features.yaml, competitors.yaml, keywords, cluster, and queue.

"Scan new docs at [path]"
   → Extracts features from new documentation files.

─── COMPETITORS ─────────────────────────────────

"Update competitor: [name] now supports [feature]"
"[Competitor] raised pricing. Update."
"Add competitor: [name] (https://url.com)"

─── KEYWORDS ────────────────────────────────────

"Import keywords: [paste CSV or list]"
"Pull keywords via MCP for [topic]"
"What keywords should I target next?"

─── TOPIC CLUSTERS ──────────────────────────────

"Show topic cluster status"
"Create cluster for [topic]"
"What cluster pages to write next?"

─── AUDITS ──────────────────────────────────────

"Run a content audit"
"Check keyword cannibalization"
"What should I write next?"
"Which blogs need updating?"
"Show feature coverage gaps"

─── CONFIG ──────────────────────────────────────

Edit .seo-engine/config.yaml anytime to change:
- Author info, trust signals, testimonials
- CTA text/URL, word count limits
- Add/remove competitors
- Change publishing cadence
- Add review links (Trustpilot, Product Hunt, etc.) as they become available

─── BLOG DIRECTORY ──────────────────────────────

Blog files go in: content/blog/{slug}.md
Image files go in: public/images/blog/

This directory needs to be created before the first blog is saved.
Run: mkdir -p content/blog public/images/blog

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
