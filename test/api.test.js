'use strict';
const test = require('node:test');
const assert = require('node:assert');
process.env.SIGNING_SECRET = 'test-secret-test-secret-test-secret-123';
const seal = require('../api/seal');
const sign = require('../api/sign');
const verify = require('../api/verify');

function call(fn, body) {
  return new Promise((resolve) => {
    const res = { headers: {}, setHeader() {}, status(s) { this.s = s; return this; }, json(j) { resolve({ status: this.s, body: j }); } };
    fn({ method: 'POST', body, headers: { 'user-agent': 'x', 'x-vercel-ip-country': 'TH' } }, res);
  });
}
const doc = { title: 'P1', agency: 'Ag', client: 'Cl', items: [{ kind: 'scope', text: 'Home page' }, { kind: 'uat', text: 'Checkout works' }, { kind: 'out', text: 'SEO' }] };

test('seal, sign, verify, change request', async () => {
  const s = await call(seal, doc);
  assert.equal(s.status, 200);
  const v = await call(verify, { token: s.body.token });
  const items = v.body.data.items;
  const decisions = Object.fromEntries(items.map((i) => [i.id, { status: i.kind === 'out' ? 'acknowledged' : 'accepted' }]));
  const r = await call(sign, { token: s.body.token, name: 'Jane', agree: true, decisions });
  assert.equal(r.status, 200);
  assert.equal(r.body.outcome, 'approved');
  const cr = await call(seal, { ...doc, items: [...items, { kind: 'scope', text: 'Blog' }], parent: r.body.receipt });
  assert.equal(cr.status, 200);
  const cv = await call(verify, { token: cr.body.token });
  assert.equal(cv.body.data.revision, 2);
  assert.equal(cv.body.data.parent.items.length, 3);
  // Unchanged items keep their ids so the client sees an accurate diff.
  assert.deepEqual(cv.body.data.items.slice(0, 3).map((i) => i.id), items.map((i) => i.id));
});

test('tampering is detected', async () => {
  const s = await call(seal, doc);
  const [v, p, sig] = s.body.token.split('.');
  const obj = JSON.parse(Buffer.from(p, 'base64url'));
  obj.title = 'Hacked';
  const bad = [v, Buffer.from(JSON.stringify(obj)).toString('base64url'), sig].join('.');
  const r = await call(verify, { token: bad });
  assert.equal(r.status, 400);
});

test('rejection needs a comment; all items must be decided', async () => {
  const s = await call(seal, doc);
  const items = (await call(verify, { token: s.body.token })).body.data.items;
  const r1 = await call(sign, { token: s.body.token, name: 'J', agree: true, decisions: {} });
  assert.equal(r1.status, 400);
  const dec = { [items[0].id]: { status: 'rejected' }, [items[1].id]: { status: 'accepted' }, [items[2].id]: { status: 'acknowledged' } };
  assert.equal((await call(sign, { token: s.body.token, name: 'J', agree: true, decisions: dec })).status, 400);
  dec[items[0].id].note = 'Needs dark mode';
  const ok = await call(sign, { token: s.body.token, name: 'J', agree: true, decisions: dec });
  assert.equal(ok.body.outcome, 'changes_requested');
});

test('waitlist rate limit holds across instances (Blob-backed)', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test';
  const store = new Map();
  const fake = {
    list: async ({ prefix, limit }) => ({ blobs: [...store.keys()].filter((k) => k.startsWith(prefix)).slice(0, limit).map((pathname) => ({ pathname, url: pathname })) }),
    put: async (key, data) => { store.set(key, data); return {}; },
    del: async (urls) => { [].concat(urls).forEach((u) => store.delete(u)); },
  };
  require.cache[require.resolve('@vercel/blob')] = { exports: fake, loaded: true, id: 'blob' };
  const send = (i) => {
    // Fresh module per request simulates a new serverless instance (empty memory).
    delete require.cache[require.resolve('../api/waitlist')];
    const waitlist = require('../api/waitlist');
    return new Promise((resolve) => {
      const res = { setHeader() {}, status(s) { this.s = s; return this; }, json() { resolve(this.s); } };
      waitlist({ method: 'POST', body: { email: i === 0 ? 'bad' : `u${i}@b.co` }, headers: { 'x-real-ip': '203.0.113.9' } }, res);
    });
  };
  const codes = [];
  for (let i = 0; i < 7; i++) codes.push(await send(i));
  assert.deepEqual(codes, [400, 200, 200, 200, 200, 429, 429]);
  const otherIp = await new Promise((resolve) => {
    const res = { setHeader() {}, status(s) { this.s = s; return this; }, json() { resolve(this.s); } };
    require('../api/waitlist')({ method: 'POST', body: { email: 'x@b.co' }, headers: { 'x-real-ip': '198.51.100.1' } }, res);
  });
  assert.equal(otherIp, 200);
  assert.ok(![...store.keys()].some((k) => k.includes('203.0.113.9')), 'raw IP must not be stored');
});
