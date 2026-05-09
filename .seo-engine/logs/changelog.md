# SEO Engine Changelog

## 2026-05-09 — Engine Initialized

**Action:** SEO Content Engine setup complete

**Created:**
- `.seo-engine/config.yaml` — project config with PortTrip metadata, competitors, author, trust signals
- `.seo-engine/data/features.yaml` — 27 features across 6 categories extracted from source code scan
- `.seo-engine/data/competitors.yaml` — 3 competitors (ChatGPT, DIY Cruise Ports, CruisePortIQ) with feature matrix
- `.seo-engine/data/seo-keywords.csv` — 24 seed keywords across 4 topic clusters
- `.seo-engine/data/topic-clusters.yaml` — 4 topic clusters, 4 pillar pages, 20 cluster pages
- `.seo-engine/data/content-map.yaml` — initialized empty (no existing blog posts found)
- `.seo-engine/data/content-queue.yaml` — 14 blog ideas queued (4 high, 7 medium, 3 low priority)
- `.seo-engine/templates/blog-frontmatter.yaml` — frontmatter schema for custom React SPA
- `.seo-engine/templates/blog-structures.yaml` — 6 blog type structures with voice guidelines
- `.seo-engine/templates/comparison-template.md` — X vs Y comparison template
- `.seo-engine/templates/tone-guide.md` — style rules, E-E-A-T requirements, competitor mention rules
- `.seo-engine/USAGE-GUIDE.md` — command reference
- `CLAUDE.md` — engine instructions appended

**Data sources:**
- Source code scan: pages/ and components/ directories (8 pages, 30+ components)
- User interview: competitors, topics, trust signals, author
- No existing blog posts found

**Cannibalization conflicts:** None (no existing blogs)

**Notes:**
- No blog directory found — content/blog/ path configured, needs to be created before first blog
- All 4 pillar pages require SERP data before writing (marked pending_serp_research)
- Competitor data for DIY Cruise Ports and CruisePortIQ is unverified — research needed
