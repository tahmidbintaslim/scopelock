'use strict';
const { email, str, handler, httpError, sha256 } = require('./_lib');

// Best-effort per-IP limit. Instances are short-lived, so a firewall rule backs it up.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

module.exports = handler(async (body, req) => {
  if (body.company) return { ok: true }; // honeypot
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (ip && limited(ip)) throw httpError(429, 'Too many requests, try again in a few minutes');
  const addr = email(body.email, 'Email');
  if (!addr) throw httpError(400, 'Email is required');
  const plan = ['free', 'pro', 'agency'].includes(body.plan) ? body.plan : 'free';
  const note = str(body.note, 300, 'Note', false);
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw httpError(503, 'Waitlist is temporarily unavailable');
  const { put } = require('@vercel/blob');
  await put(`waitlist/${sha256(addr).slice(0, 24)}.json`,
    JSON.stringify({ email: addr, plan, note, at: new Date().toISOString() }),
    { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
  return { ok: true };
});
