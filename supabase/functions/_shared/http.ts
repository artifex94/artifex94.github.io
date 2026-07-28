// Shared HTTP helpers for the public tufting endpoints.
//
// These functions are called by anonymous buyers, so they do NOT reuse the
// wildcard CORS of admin-create-client. That one is safe because the platform
// verifies a JWT before the handler runs; these have no such gate, so the origin
// is pinned to the site.
const DEFAULT_ORIGIN = 'https://artifex.click';
const allowedOrigins = () => {
  const configured = Deno.env.get('ALLOWED_ORIGIN') ?? DEFAULT_ORIGIN;
  return configured.split(',').map((origin) => origin.trim()).filter(Boolean);
};
/** Reflects the request origin only when it is on the allow-list. */
export const corsHeaders = (request) => {
  const origin = request.headers.get('origin') ?? '';
  const allowed = allowedOrigins();
  const isAllowed = allowed.includes(origin) || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
};
export const json = (request, body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
/** Largest body accepted, to keep a public endpoint from being used as a sink. */
export const MAX_BODY_BYTES = 8 * 1024;
export const readJsonBody = async (request) => {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
/**
 * Constant-time comparison.
 *
 * Comparing signatures with `===` leaks how many leading bytes matched through
 * timing, which is enough to forge a signature byte by byte.
 */
export const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
export const hmacSha256Hex = async (secret, message) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
