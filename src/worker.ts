/**
 * API for the optional early-bird email. Static pages stay on the assets binding.
 * The raw address is written to D1 and is not logged.
 */

import { isEmail, normalizeEmail } from './lib/email';

const TOOLS = new Set([
  'ai-seating-chart-generator',
  'ai-org-chart-generator',
  'ai-funnel-chart-generator',
]);
const HOUR_MS = 60 * 60 * 1000;
const HOURLY_LIMIT = 5;

interface D1Value {
  hits: number;
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB?: D1Database;
}

function json(body: { ok?: boolean; error?: string }, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function ipHash(request: Request): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`babeldoc-early-access:${ip}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function handleEarlyAccess(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== url.host) return json({ error: 'Request was refused.' }, 403);
    } catch {
      return json({ error: 'Request was refused.' }, 403);
    }
  }
  if (!env.DB) return json({ error: 'Email signup is not available yet.' }, 503);

  const raw = await request.text();
  if (raw.length > 2_000) return json({ error: 'That request is too large.' }, 413);
  let payload: { email?: unknown; tool?: unknown };
  try {
    payload = JSON.parse(raw) as { email?: unknown; tool?: unknown };
  } catch {
    return json({ error: 'Enter a valid email address.' }, 400);
  }
  const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
  const tool = typeof payload.tool === 'string' ? payload.tool : '';

  try {
    const bucket = Math.floor(Date.now() / HOUR_MS);
    const hit = await env.DB.prepare(
      `INSERT INTO early_access_hits (ip_hash, bucket, hits) VALUES (?, ?, 1)
       ON CONFLICT(ip_hash, bucket) DO UPDATE SET hits = hits + 1
       RETURNING hits`,
    )
      .bind(await ipHash(request), bucket)
      .first<D1Value>();
    if ((hit?.hits ?? 1) > HOURLY_LIMIT) return json({ error: 'Too many attempts. Try again later.' }, 429);
  } catch (error) {
    const missing = error instanceof Error && /no such table/i.test(error.message);
    console.error(missing ? 'early-access table is missing' : 'early-access rate limit failed');
    return json({ error: 'Email signup is not available yet.' }, 503);
  }

  if (!isEmail(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (!TOOLS.has(tool)) return json({ error: 'That tool is not part of early-bird signup.' }, 400);

  try {
    await env.DB.prepare(
      `INSERT INTO early_access (email, tool, created_at) VALUES (?, ?, ?)
       ON CONFLICT(email) DO NOTHING`,
    )
      .bind(email, tool, new Date().toISOString())
      .run();
  } catch (error) {
    const missing = error instanceof Error && /no such table/i.test(error.message);
    console.error(missing ? 'early-access table is missing' : 'early-access write failed');
    return json({ error: 'Email signup is not available yet.' }, 503);
  }

  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    if (path === '/api/early-access') return handleEarlyAccess(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
