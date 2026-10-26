'use strict';
// Shared helpers. All rendering uses textContent; never innerHTML with user data.
const $ = (s, r = document) => r.querySelector(s);
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) n.append(c);
  return n;
}
async function api(path, body) {
  const r = await fetch('/api/' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ error: 'Network error' }));
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}
function track(name, props) { try { window.va && window.va('event', { name, data: props }); } catch {} }
const KIND = { scope: 'In scope', uat: 'UAT check', out: 'Out of scope' };
const tokenFromHash = () => decodeURIComponent(location.hash.slice(1));
function copyBtn(input) {
  return el('button', { class: 'btn ghost', type: 'button', onclick: async () => {
    try { await navigator.clipboard.writeText(input.value); } catch { input.select(); document.execCommand('copy'); }
  }, text: 'Copy' });
}
function fmt(iso) { try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; } }
// Vercel Web Analytics queue (script loaded from /_vercel/insights/script.js)
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
