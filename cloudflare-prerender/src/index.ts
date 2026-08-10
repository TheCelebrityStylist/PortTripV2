interface Env {
  BROWSER: BrowserRun;
}

type BrowserRun = {
  quickAction(action: string, input: Record<string, unknown>): Promise<Response>;
};

const BOT_UA = /(googlebot|google-inspectiontool|bingbot|bingpreview|duckduckbot|yandexbot|baiduspider|applebot|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|gptbot|oai-searchbot|chatgpt-user|perplexitybot|claudebot|claude-user)/i;

const BYPASS_PARAM = '__pt_prerender';
const CACHE_TTL_SECONDS = 60 * 60;

const PRIVATE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/cruise-dashboard',
  '/hq/',
  '/my-cruises',
  '/account',
  '/login',
  '/register',
  '/checkout-return',
  '/partner-dashboard',
  '/operator-dashboard',
  '/cruise-profile-setup',
];

const STATIC_EXT = /\.(?:js|mjs|css|map|json|xml|txt|ico|png|jpe?g|gif|webp|avif|svg|woff2?|ttf|eot|pdf|zip)$/i;

function isPrivateOrAsset(url: URL) {
  if (STATIC_EXT.test(url.pathname)) return true;
  return PRIVATE_PREFIXES.some(prefix => url.pathname === prefix || url.pathname.startsWith(prefix));
}

function shouldPrerender(request: Request, url: URL) {
  if (request.method !== 'GET') return false;
  if (url.searchParams.get(BYPASS_PARAM) === '1') return false;
  if (isPrivateOrAsset(url)) return false;

  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html') && accept !== '*/*') return false;

  return BOT_UA.test(request.headers.get('user-agent') || '');
}

function targetUrlForBrowser(requestUrl: URL) {
  const target = new URL(requestUrl.toString());
  target.searchParams.set(BYPASS_PARAM, '1');
  return target;
}

async function render(env: Env, target: URL) {
  const response = await env.BROWSER.quickAction('content', {
    url: target.toString(),
    gotoOptions: {
      waitUntil: 'networkidle2',
      timeout: 30000,
    },
    // Keep JS + CSS so React can hydrate. These resources are not needed for
    // the final crawler HTML and materially slow browser rendering.
    rejectResourceTypes: ['image', 'media', 'font'],
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Browser Run failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as { success?: boolean; result?: string };
  if (!payload.success || typeof payload.result !== 'string' || payload.result.length < 500) {
    throw new Error('Browser Run returned incomplete HTML');
  }

  return payload.result;
}

function prerenderHeaders(source: Headers) {
  const headers = new Headers(source);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}`);
  headers.set('vary', 'User-Agent, Accept-Encoding');
  headers.set('x-porttrip-prerender', 'cloudflare-browser-run');
  headers.delete('content-length');
  headers.delete('content-encoding');
  return headers;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Human visitors, app routes, APIs and assets remain exactly on the existing
    // Base44 path. This Worker must never become a replacement app origin.
    if (!shouldPrerender(request, url)) {
      return fetch(request);
    }

    const cache = caches.default;
    const cacheKeyUrl = new URL(url.toString());
    cacheKeyUrl.searchParams.delete(BYPASS_PARAM);
    const cacheKey = new Request(cacheKeyUrl.toString(), {
      method: 'GET',
      headers: { accept: 'text/html', 'x-porttrip-cache': 'crawler' },
    });

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const target = targetUrlForBrowser(url);
      const html = await render(env, target);

      // Fetch the normal origin once for status/security headers. Do not use its
      // HTML body because Base44 currently sends generic crawler metadata for many
      // dynamic routes.
      const originRequest = new Request(target.toString(), request);
      const origin = await fetch(originRequest);
      if (origin.status >= 400) return origin;

      const response = new Response(html, {
        status: origin.status,
        statusText: origin.statusText,
        headers: prerenderHeaders(origin.headers),
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      // SEO rendering failure must never take the site down. Fall back to the
      // current Base44 response and expose a diagnostic header in Cloudflare logs.
      const fallback = await fetch(request);
      const headers = new Headers(fallback.headers);
      headers.set('x-porttrip-prerender-error', error instanceof Error ? error.message.slice(0, 180) : 'unknown');
      return new Response(fallback.body, {
        status: fallback.status,
        statusText: fallback.statusText,
        headers,
      });
    }
  },
} satisfies ExportedHandler<Env>;
