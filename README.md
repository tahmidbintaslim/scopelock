<p align="center"><img src="public/favicon.svg" width="56" alt=""></p>
<h1 align="center">ScopeLock</h1>
<p align="center"><b>Tamper-evident scope and UAT sign-off links for agencies.</b><br>
The client ticks each item and signs, and you both get an HMAC-signed receipt. Every later "one more thing" becomes a change request with a diff.<br>
No database. No client login.</p>
<p align="center"><a href="https://scopelock-sable.vercel.app">Live app</a> · <a href="#how-it-works">How it works</a> · <a href="#self-host">Self-host</a></p>

<p align="center"><a href="https://scopelock-sable.vercel.app"><b>▶ Try the live demo</b></a> &nbsp;·&nbsp; free, no signup</p>

<p align="center"><img src="docs/img/demo.gif" width="760" alt="Demo: an agency creates a sign-off, the client accepts and rejects items and signs, then a change request shows the diff"></p>

## Why

Most agency disputes come down to one sentence: *"I thought that was included."* A PDF SOW and an email that says "looks good" don't settle it. ScopeLock records **what was shown, what was approved or rejected, by whom and when**, in a form neither side can quietly edit later.

## Screenshots

| 1. Agency creates a sign-off | 2. Client reviews and signs |
|---|---|
| <img src="docs/img/02-create.png" alt="Create form with in-scope, UAT and out-of-scope items"> | <img src="docs/img/04-client-review.png" alt="Client page with accept or reject per item and a comment on the rejected one"> |
| **3. Signed receipt with evidence** | **4. Change request shown as a diff** |
| <img src="docs/img/05-receipt.png" alt="Receipt showing approved and rejected items, signer, time and hashes"> | <img src="docs/img/07-client-diff.png" alt="Change request with a changed item (was / now) and an added item"> |
| **5. Anyone can verify a link** | **6. An edited link fails verification** |
| <img src="docs/img/08-verify.png" alt="Verify page confirming a valid receipt"> | <img src="docs/img/09-tampered.png" alt="Verify page rejecting a receipt whose signer name was edited"> |

<p align="center"><img src="docs/img/10-mobile.png" width="280" alt="Client sign page on a phone"><br><sub>Works on a phone, which is where most clients open the link.</sub></p>

## How it works

1. **Seal.** The agency lists in-scope items, UAT checks and out-of-scope exclusions. `POST /api/seal` returns `v1.<base64url(json)>.<hmac>`, and that token is the whole document.
2. **Sign.** The client opens `/sign#<token>`. The data sits in the URL fragment, so it never reaches server logs. They accept or reject each item (a rejection needs a comment), acknowledge the exclusions and sign. `POST /api/sign` checks the token and returns a signed **receipt** that embeds the document, its SHA-256, the decisions, the signer, a timestamp, the country and a UA hash.
3. **Verify.** `/verify` (or `POST /api/verify`) recomputes the HMAC. If a single byte changed, verification fails.
4. **Change request.** "Start a change request" on a receipt seals revision *n+1* linked to the baseline receipt's hash. The client sees **added / changed / removed** items relative to what they approved before.

| | Free (this repo) | Pro $19/mo | Agency $49/mo |
|---|---|---|---|
| Unlimited sign-off links, receipts, change requests | Yes | Yes | Yes |
| Saved workspace, email notifications, branding, PDF | No | Yes | Yes |
| Seats, white-label domain, API/webhooks | No | No | Yes |

## Security model (read this before relying on it)

* Integrity comes from HMAC-SHA256 with a server secret, compared in constant time. Tokens can't be forged or edited without `SIGNING_SECRET`.
* Signer identity is **self-declared**: the receipt shows what the person who opened the link claimed. It is a sign-off record, not an eIDAS or ESIGN qualified signature.
* If you rotate the secret, every existing link stops verifying. To rotate safely, add key IDs (`v2.<kid>.…`), which is on the roadmap.
* Inputs are size-limited (64 KB body, 100 items, 600 chars per item). Waitlist sign-ups are rate-limited per IP (5 per 10 min), with counters in Blob under a keyed hash, so raw IPs are never stored. The UI renders everything with `textContent`, under a strict CSP.

## Self-host

```bash
git clone https://github.com/tahmidbintaslim/scopelock && cd scopelock
npm install && npm test
# Vercel: set SIGNING_SECRET (32+ random chars); optional BLOB_READ_WRITE_TOKEN for the waitlist,
# STRIPE_LINK_PRO / STRIPE_LINK_AGENCY for checkout redirects
npx vercel deploy
```

No framework and no build step: static files in `public/` plus four Node functions in `api/`.

### Run it locally

```bash
SIGNING_SECRET=$(openssl rand -base64 32) npm run dev   # http://localhost:3000, no Vercel CLI needed
```

`scripts/capture-screenshots.js` regenerates everything in `docs/img/` from a real run against the dev server.

**Payments:** checkout uses Stripe Payment Links in **test mode** for now. Pro and Agency are early access.

## Roadmap

- [ ] Key IDs and secret rotation
- [ ] Pro: accounts and a workspace (Postgres), email on sign/reject, logo and colours, server-rendered PDF
- [ ] Email OTP to confirm signer identity (optional per document)
- [ ] Import from Markdown, Notion or Google Docs checklists
- [ ] Agency: webhooks, seats, custom domain

## License

MIT
