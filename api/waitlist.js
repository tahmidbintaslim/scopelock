'use strict';
const { email, str, handler, httpError, sha256 } = require('./_lib');

module.exports = handler(async (body) => {
  if (body.company) return { ok: true }; // honeypot
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
