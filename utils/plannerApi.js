/**
 * plannerApi — frontend wrapper for Vercel API routes.
 * Matches the base44.functions.invoke() return shape: { data: { ... } }
 * so call sites need minimal changes.
 */

async function callApi(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  // Wrap in { data: ... } to match base44.functions.invoke shape
  return { data: json };
}

/**
 * Generate or refine an itinerary plan.
 * Replaces: base44.functions.invoke('plannerEngine', { action, plan })
 */
export async function invokePlanner({ action, plan }) {
  return callApi('/api/planner', { action, plan });
}

/**
 * Parse pasted itinerary text.
 * Replaces: base44.functions.invoke('parseItinerary', { text })
 */
export async function invokeParser({ text }) {
  return callApi('/api/parse', { text });
}

/**
 * Stub for file upload — returns a message to paste instead.
 * Replaces: base44.functions.invoke('parseItinerary', { fileUrl, fileType })
 */
export async function invokeParserUpload() {
  return callApi('/api/parse', { stub: 'upload' });
}
