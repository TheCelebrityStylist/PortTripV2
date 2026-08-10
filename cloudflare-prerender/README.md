# PortTrip Cloudflare crawler prerender

Emergency SEO layer for the Base44 CSR app. Human visitors continue to the existing Base44 origin unchanged. Recognised search/social/AI crawlers receive the exact same PortTrip page after React has rendered in Cloudflare Browser Run.

## Why this exists

Live verification on 2026-08-10 found:

- `https://porttrip.com/ports/rome` returns HTTP 200 through Cloudflare.
- Googlebot is not blocked by robots.txt or Cloudflare.
- 58 of 94 sitemap URLs return Base44 generic crawler metadata, including port routes.
- `/ports/rome` currently returns crawler title `ports | PortTrip` and description `ports on PortTrip. PortTrip manages 5 data types including blocked users.` instead of the page's React SEO metadata.

This Worker addresses the rendering/metadata gap without migrating the product off Base44.

## Architecture

Use a **Cloudflare Worker Route** in front of the existing proxied `porttrip.com` hostname. Do not replace the Base44 origin with a Worker Custom Domain.

- Human/app requests -> `fetch(request)` -> existing Base44 origin.
- Search/social/AI crawler GET requests for public HTML -> Browser Run renders the same public URL with `?__pt_prerender=1` -> Worker returns final HTML.
- Private/app/admin/assets are never prerendered.
- Rendered crawler HTML is cached for one hour.
- Any Browser Run failure falls back to Base44, so the Worker should not take the live site down.

## Deploy

1. In Cloudflare, confirm `porttrip.com` is an active proxied zone.
2. Enable Browser Run for the account if needed.
3. In `wrangler.toml`, uncomment the `routes` block after confirming the zone name.
4. Install and test remotely:

```bash
cd cloudflare-prerender
npm install
npx wrangler dev --remote
```

5. Test the Worker directly in remote dev mode.
6. Deploy:

```bash
npx wrangler deploy
```

Browser Run Quick Actions require a compatibility date >= 2026-03-24. The config uses 2026-08-10.

## Mandatory production tests

After deployment:

```bash
curl -sS -A "Googlebot" -D - https://porttrip.com/ports/rome | grep -Ei "x-porttrip-prerender|<title>|description|canonical|Rome Cruise Port|Civitavecchia"
curl -sS -A "Googlebot" https://porttrip.com/ports/barcelona | grep -Ei "Barcelona Cruise Port|<title>|description|canonical"
curl -sS -A "Googlebot" https://porttrip.com/ports/santorini | grep -Ei "Santorini Cruise Port|<title>|description|canonical"
curl -sS -A "Googlebot" https://porttrip.com/ports/naples | grep -Ei "Naples Cruise Port|<title>|description|canonical"
curl -sS -A "Googlebot" https://porttrip.com/blog | grep -Ei "<title>|description|canonical|Blog"
```

Expected header:

`x-porttrip-prerender: cloudflare-browser-run`

Expected HTML must contain each route's real React-rendered title, H1/content, canonical and JSON-LD. It must NOT contain the Base44 generic page description as the active meta description.

Also verify normal users are untouched:

```bash
curl -sS -D - https://porttrip.com/ -o /dev/null
curl -sS -D - https://porttrip.com/pricing -o /dev/null
```

Normal browser responses should not need `x-porttrip-prerender`.

## Google Search Console recovery

Once tests pass:

1. Inspect `/ports/rome`, `/ports/barcelona`, `/ports/santorini`, `/ports/naples`, and the highest-impression historical URLs in GSC.
2. Use **Test Live URL** and confirm rendered HTML/title/canonical.
3. Request indexing for the priority pages.
4. Resubmit `https://porttrip.com/sitemap.xml`.
5. Do not mass-request all 94 URLs on day one; prioritise the pages with existing impressions and Tier 1 pages.

## Safety

This is dynamic rendering of the same page content, not a separate SEO page. Do not inject crawler-only keywords, links, claims or copy. Keep crawler HTML materially equivalent to what users receive after React renders.
