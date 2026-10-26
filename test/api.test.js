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

test('waitlist is rate limited per IP', async () => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  const waitlist = require('../api/waitlist');
  const send = () => new Promise((resolve) => {
    const res = { setHeader() {}, status(s) { this.s = s; return this; }, json() { resolve(this.s); } };
    waitlist({ method: 'POST', body: { email: 'a@b.co' }, headers: { 'x-real-ip': '203.0.113.9' } }, res);
  });
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push(await send());
  assert.deepEqual(codes, [503, 503, 503, 503, 503, 429]);
});
