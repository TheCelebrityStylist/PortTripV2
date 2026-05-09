## SEO Content Engine

SEO engine lives in `.seo-engine/`. Use it for all blog and SEO tasks.

**UNIVERSAL RULE: For ANY task involving blogs, content, SEO, keywords, competitors, or documentation in this project — ALWAYS read `.seo-engine/config.yaml` and the relevant data files FIRST before responding.** This includes writing, evaluating, reviewing, editing, auditing, planning, or answering questions about content. Never rely on your default behavior — always check the engine data.

**Sub-Agent Rule:** Parallelize independent tasks. Don't do sequentially what can run simultaneously.

### File Reference

| File | Purpose | When |
|------|---------|------|
| `config.yaml` | Settings, author, trust signals | Before any task |
| `data/features.yaml` | Feature registry | Before writing |
| `data/competitors.yaml` | Competitor matrix | Before comparisons |
| `data/seo-keywords.csv` | Keywords + SERP data | Before choosing topics |
| `data/content-map.yaml` | Blog ↔ feature ↔ keyword map | Before writing |
| `data/content-queue.yaml` | Prioritized ideas | When deciding what to write |
| `data/topic-clusters.yaml` | Pillar/cluster architecture | Before writing |
| `templates/blog-frontmatter.yaml` | Frontmatter format | When generating |
| `templates/blog-structures.yaml` | Outlines by type | When structuring |
| `templates/tone-guide.md` | Style + E-E-A-T rules | Before writing |
| `logs/changelog.md` | Audit trail | After every action |

### Core Rules

1. **Read before writing.** Always read: config, features, content-map, content-queue, topic-clusters, tone-guide.
2. **Never fabricate features.** Only reference what's in features.yaml.
3. **Competitor claims need confidence.** If "unverified" or 90+ days old → caveat or direct reader to competitor's page.
4. **No web search for SERP data.** NEVER use your built-in web search to research keywords or SERP results. It produces generic data that leads to generic content. ALWAYS ask the user to provide real Google SERP data (top results, PAA, related searches). The ONLY exception is if a dedicated SEO MCP tool (Semrush, Ahrefs) is connected.
5. **Cannibalization check before every blog.** Search content-map for overlapping keywords. If conflict → recommend updating existing blog. Only proceed if angle is genuinely different.
6. **Every blog needs a unique angle.** Define what's different from what ranks. "More comprehensive" is NOT an angle.
7. **E-E-A-T mandatory.** Every blog must include at least one: testimonial, metric, experience, or review link from config.trust_signals. If config has no trust signals yet, ask user to provide one before publishing.
8. **Human review required.** Save all blogs as `draft: true`. Never auto-publish. Alert user to review.
9. **Respect pillar/cluster linking.** Cluster pages → link to pillar. Pillar → link to all cluster pages. Non-negotiable.
10. **Update all files after writing:**
   - content-map.yaml (register blog)
   - features.yaml (blog_refs)
   - seo-keywords.csv (mapped_blog_slugs)
   - content-queue.yaml (status)
   - topic-clusters.yaml (if cluster blog)
   - changelog.md (log action)
11. **Never delete data.** Add or update only.
12. **Log everything** to changelog.md.

### SERP Intent Interpretation Rules

When analyzing SERP data (whether from user-provided Google results or SEO MCP tool), classify the intent BEFORE deciding content structure:

**All product/tool/template pages in top results:**
→ Intent is TRANSACTIONAL. Google wants tools, not guides.
→ Your content MUST serve the transactional intent first (provide tool/template/CTA immediately), then add educational depth below.
→ Do NOT write a pure informational guide — it will not rank.

**Mix of guides + product pages:**
→ Intent is BLENDED. Google rewards both formats.
→ A comprehensive guide with embedded tool/template CTAs works well here.

**All informational guides/blogs in top results:**
→ Intent is INFORMATIONAL. Google wants educational content.
→ Write a thorough guide. Product mentions should be natural, not forced.

**All comparison/listicle pages:**
→ Intent is COMMERCIAL INVESTIGATION. User is evaluating options.
→ Write a comparison or listicle. Don't write a how-to.

**Rule: NEVER fight the SERP.** If Google shows product pages, don't write a pure guide. If Google shows guides, don't write a product page. Match the dominant intent, then add your unique value on top.

### Blog Writing Workflow

**STEP 1: Pre-Writing Research** (sub-agents for parallel tasks)

a) Read all data files
b) Pick topic: from queue (highest priority "planned") or user request
c) **Cannibalization check** — scan content-map for overlapping keywords. If conflict: recommend update. If proceeding: document why in queue.
d) **SERP Analysis — CRITICAL RULE:**
   - **DO NOT use your built-in web search tool for SERP research.** Your web search does not provide search volume, keyword difficulty, People Also Ask layout, or the actual SERP format Google shows. It gives generic results that lead to generic content.
   - IF a dedicated SEO MCP tool is connected (like Semrush, Ahrefs MCP) → use that tool for structured keyword data
   - In ALL other cases → ask the user to manually search Google and provide real SERP data:
     ```
     Before writing, I need real SERP data for: "{keyword}"
     Please search this on Google and provide:
     1. Top 3-5 ranking page titles + URLs
     2. People Also Ask questions (4-6)
     3. Related searches shown at the bottom of Google
     4. Related keywords from your SEO tools like Ahrefs, SEMrush, Ubersuggest (optional)
     ```
   - WAIT for response before proceeding. Do NOT proceed without SERP data. Do NOT substitute your own web search.
e) **Define unique angle** from SERP data gaps. 1 sentence. If no genuine gap found, tell user.

**STEP 2: Draft** (sub-agents for long blog sections)

a) Select structure from blog-structures.yaml
   **If writing a PILLAR page**, it MUST include ALL of these sections (adapt order based on SERP intent):
   - Definition: What is {topic}? (even if brief — cluster pages link here for this)
   - Why it matters: Why do people need {topic}?
   - Types/categories: Different kinds of {topic} (these map to cluster pages — link to each)
   - How-to / step-by-step: How to create/do/use {topic}
   - Best practices / tips: What makes a good {topic}
   - Common mistakes to avoid
   - Tools/templates: Options available (include your product naturally)
   - FAQ from People Also Ask data
   If SERP intent is transactional: lead with tools/templates/CTA section, then educational sections below.
   If SERP intent is informational: lead with definition and how-to, tools section later.
   A pillar page that skips foundational sections (definition, types, why it matters) is INCOMPLETE — cluster pages need these sections to link back to.
b) Read tone-guide.md — use correct voice for this blog type
c) Build frontmatter: title ≤ 60 chars, description ≤ 160 chars, slug ≤ 5 words
d) Write blog:
   - Primary keyword in: title, first paragraph, one H2, description, slug
   - Secondary keywords natural
   - FAQ from People Also Ask data
   - Internal links: prioritize pillar (if cluster page), then relevant blogs. Varied anchor text.
   - External links: 1-2 authoritative (not competitors)
e) **Inject E-E-A-T:** author name, testimonial/metric/experience from config, review link
f) **Ask user:**
```
Before I finalize, want to add anything?
- A personal experience or story related to this topic?
- Specific user feedback or quotes?
- External sources to reference? (Say "skip" if ready as-is)
```

**STEP 3: Post-Writing** (sub-agents — all parallel)

a) Save blog with `draft: true` to `content/blog/{slug}.md`
b) Update content-map, features, keywords, queue, clusters, changelog
c) **Alert:**
```
✅ Blog drafted: "{title}"
📄 File: content/blog/{slug}.md | Words: {count} | Links: {count}
🏗️ Cluster: {name or "standalone"}
⚠️ REVIEW REQUIRED — say "Approve blog {slug}" or give feedback.
```

### Audit Workflow

1. Feature coverage gaps (empty blog_refs)
2. Keyword gaps (high priority, no blog)
3. Cluster completion (% per cluster)
4. Keyword cannibalization
5. Stale content (90+ days)
6. Competitor data freshness (90+ days)
7. Internal linking gaps
8. E-E-A-T gaps (has_eeat_signals: false)
9. Report + update queue + log

### Evaluate / Review Blog Workflow

When asked to evaluate, review, analyze, or give feedback on a blog (existing or draft):

1. Read the blog file
2. Read config.yaml, features.yaml, competitors.yaml, content-map.yaml, topic-clusters.yaml, tone-guide.md
3. Evaluate against ALL of these criteria:
- **SEO check:** Primary keyword in title, first paragraph, one H2, description, slug? Title ≤ 60 chars? Description ≤ 160 chars?
- **Keyword cannibalization:** Does another blog target the same keyword?
- **Feature accuracy:** Are all mentioned features actually in features.yaml? Any fabricated claims?
- **Competitor accuracy:** Are competitor claims backed by data in competitors.yaml? What's the confidence level?
- **E-E-A-T signals:** Does the blog include testimonials, metrics, experience, or review links? If not, flag it.
- **Cluster alignment:** Is this blog part of a cluster? Does it link to its pillar? Does the pillar link back?
- **Internal linking:** Links to at least 2 other blogs? Anchor text varied and contextual?
- **Unique angle:** What is this blog's angle? Is it genuinely different from what ranks for the target keyword?
- **Tone/voice:** Does it match the blog type's voice from blog-structures.yaml?
- **Content quality:** Is it specific and concrete or vague and generic? Does it read like AI filler?
- **Word count:** Meets minimum from config?
- **Pillar completeness (if pillar):** Does it have ALL mandatory sections — definition, types, why it matters, how-to, best practices, common mistakes, tools, FAQ?
- **SERP intent match:** Does the content format match what Google rewards for this keyword? (Apply SERP Intent Interpretation Rules)
- **FAQ quality:** Are FAQ questions drawn from real People Also Ask data or generic?
4. Output a structured report with: score (out of 10), strengths, issues found, specific fix recommendations
5. If blog is in content-map with `draft: true`: provide clear approve/reject recommendation

### Create Topic Cluster Workflow

When asked to create a new topic cluster:

1. Read features.yaml and existing topic-clusters.yaml
2. Design cluster pages from features + topic knowledge (no SERP needed for these)
3. **Before finalizing the pillar page:** ask user for SERP data on the pillar keyword:
```
I'm designing the pillar page for the "{cluster name}" cluster. Please Google "{pillar keyword}" and share:
1. Top 5 ranking page titles + URLs
2. People Also Ask questions
3. Related searches
```
4. WAIT for response
5. Apply SERP Intent Interpretation Rules to decide pillar format (guide vs tool page vs hybrid)
6. Ensure pillar includes ALL mandatory sections (definition, types, why it matters, how-to, best practices, common mistakes, tools, FAQ)
7. Save cluster to topic-clusters.yaml
8. Add all pages to content-queue.yaml (with cannibalization check)
9. Add keywords to seo-keywords.csv
10. Log to changelog.md

### New Feature Workflow

1. Add to features.yaml
2. Add to competitors.yaml (unverified)
3. Generate keywords → seo-keywords.csv
4. Assign to cluster or create new in topic-clusters.yaml
5. Check existing blogs → mark needs-update
6. Queue blog ideas (with cannibalization check)
7. Log

### SEO Data Import Workflow

1. Merge into seo-keywords.csv (no dupes)
2. Map to features
3. Update SERP fields if available
4. Assign to clusters
5. Recalculate queue priorities
6. Generate new queue items (with cannibalization check)
7. Log

### Changelog Format

```
## YYYY-MM-DD — [Action summary]

**Action:** [What happened]
**Files changed:** [List]
**Stats:** [Counts if relevant]
**Notes:** [Anything important]
```
