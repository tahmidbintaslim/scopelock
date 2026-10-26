# Launch plan: ScopeLock, checkout-sentinel, Thai BOI tech jobs

Prepared 2026-10-26. Stripe is in **test mode** (account "Devsaround"). Nothing has been posted publicly.

## 1. Launch order

| # | Product | Revenue potential | Time to MVP | Reputation value | Verdict |
|---|---|---|---|---|---|
| 1 | **ScopeLock** (UAT and scope sign-off) | Medium-high: B2B, every agency and freelancer has this pain; $19–49/mo | **Shipped today** (stateless, no DB) | Medium-high: novel "no-DB HMAC receipts" angle for HN; a fit for PH | **Launch first** (week 1) |
| 2 | **checkout-sentinel** | Highest per customer (stores lose real money on a broken checkout); $29–149/mo | v0.2 merged, v0.3 read-only dashboard merged; needs a hosted landing page and a demo video | **Highest**: deep OSS (NestJS, BullMQ, Playwright), strongest hiring story | **Launch second** (week 3). Stagger so each launch gets its own HN/PH cycle |
| 3 | **Thai BOI tech-jobs directory** | Low-medium: job-board sponsorships and featured listings; slow to monetise | 1–2 weeks: data curation is the bottleneck, not code | High locally (Thailand dev community, LinkedIn); low on HN | **Launch third** (week 5), as a free public good that builds an audience |

Why ScopeLock goes first even though checkout-sentinel has more revenue: it is done today, it needs no infrastructure to self-serve, and it gives the owner a full launch rehearsal (PH, HN, X, LinkedIn) before the flagship OSS launch.

---

## 2. One-pagers

### ScopeLock (live: https://scopelock-sable.vercel.app)
- **ICP:** freelance developers and 2–20-person web/Shopify agencies doing fixed-price work, initially in SEA and the global remote market. Buyer: agency owner or PM. Trigger: a client dispute or a "while you're at it" request.
- **Pricing:** Free (unlimited links, receipts, change requests, ScopeLock footer). **Pro $19/mo**: workspace, email notifications, branding, PDF, CR log. **Agency $49/mo**: 10 seats, white-label domain, API/webhooks. Early-access price locked for life.
- **MVP scope (shipped):** create a sign-off (scope, UAT and out-of-scope items, paste-to-split), client sign page (accept/reject with comment, acknowledge exclusions, declaration), HMAC-signed receipt with evidence, public verify page, change requests with an added/changed/removed diff against the signed baseline, waitlist (Vercel Blob, private), Stripe Payment Links (test), privacy page.
- **Next for Pro (build only after 10 paid or 50 waitlist sign-ups):** auth plus Postgres workspace; Resend email on sign/reject; logo; PDF via @react-pdf or Playwright; signer email OTP.
- **Stack:** static HTML/CSS/vanilla JS plus four Node serverless functions; `crypto` HMAC; `@vercel/blob`; Stripe Payment Links; Vercel Web Analytics with custom events (`doc_created`, `doc_signed`, `cr_created`, `waitlist_join`, `buy_pro`, `checkout_complete`).
- **Hosting:** Vercel project `scopelock` (team "My Projects"), production alias `scopelock-sable.vercel.app`. Env: `SIGNING_SECRET` (sensitive), `BLOB_READ_WRITE_TOKEN` (linked store `scopelock-waitlist`), `STRIPE_LINK_PRO` and `STRIPE_LINK_AGENCY` (test links). Cost: $0 on Hobby until traffic grows (switch to Pro if it is used commercially, per Vercel ToS).

### checkout-sentinel
- **ICP:** Shopify Plus / WooCommerce merchants doing $50k+/month and the agencies that maintain them. Trigger: a theme or app update silently broke add-to-cart and someone noticed days later.
- **Pricing:** OSS self-host (MIT) free forever. **Hosted Starter $29/mo**: 3 journeys, every 15 minutes, Slack/email. **Growth $99/mo**: 15 journeys, every 5 minutes, mobile and desktop, screenshots, 90-day history. **Agency $149/mo**: 50 stores, client-facing status pages.
- **MVP scope:** the v0.3 read-only dashboard demo (merged, needs Pages enabled) plus a landing page with a waitlist and a Stripe link (copy ScopeLock's pattern: `api/checkout`, `api/waitlist`). Hosted multi-tenant runner comes after 10 waitlist sign-ups with a stated budget.
- **Stack:** existing NestJS API, BullMQ worker, Playwright, Postgres, Redis, Vue 3 dashboard. Hosted: Fly.io or Railway for API, worker and Redis (Playwright needs a real container; not Vercel functions), Neon Postgres, Vercel for landing and dashboard.
- **Hosting:** landing on Vercel; dashboard demo on GitHub Pages (owner action: Settings > Pages > Source = GitHub Actions).

### Thai BOI tech-jobs directory (working name "BOI Jobs TH")
- **ICP:** foreign software engineers who want to move to Thailand (work permit and visa through a BOI-promoted company), plus Thai-based engineers changing jobs. Secondary: BOI companies that want foreign talent (they pay).
- **Pricing:** free to browse, with email alerts free. **Featured employer $99/month**, **job post $49/30 days**. Later, a "relocation pack" guide at $19 one-off.
- **MVP scope:** about 80 hand-verified companies (name, BOI promotion evidence link, sponsors visas Y/N/unknown with source, stack, careers URL); jobs pulled **only** from public ATS JSON feeds (Greenhouse, Lever, Ashby, Workable, SmartRecruiters) and company career pages that allow it in robots.txt. **No LinkedIn or JobsDB scraping.** Every claim links to its source, with a "last verified" date and a "report a correction" link.
- **Stack:** Astro static site plus a nightly GitHub Action that fetches ATS feeds into JSON; Vercel Cron as an alternative; Blob for alerts sign-up.
- **Hosting:** Vercel, $0.
- **Risk to manage:** BOI status and visa sponsorship change. Label it "community-maintained, verify with the employer", never give immigration advice, and add a disclaimer.

---

## 3. Open-source star strategy

**Rules that move stars:** a hero image or GIF in the first screen, a one-line value proposition, a "try it in 30 s" path (hosted demo or `npx`/`docker compose up`), honest status badges, 8–20 relevant topics, a social preview image (Settings > Social preview, 1280×640), a pinned repo order on the profile, and a launch post per repo spaced at least 2 weeks apart. Ask for stars only once, in the README footer.

**Pin order on github.com/tahmidbintaslim:** checkout-sentinel, scopelock, shopify-ucp, sun-ui, promptpay-storefront, gmail-auto-unsubscribe.

| Repo | Polish before its launch | README hero line | Demo GIF (≤ 20 s, 800 px wide) | Topics |
|---|---|---|---|---|
| **checkout-sentinel** | Enable Pages for the v0.3 dashboard; add a "Deploy in 5 min" compose section at the top; badges (CI, license, release); CHANGELOG v0.3 | "Find out your Shopify/WooCommerce checkout is broken before your customers do." | Break the fixture's Add to cart → mobile run fails → Slack alert with screenshot → fix → recovery alert | `shopify` `woocommerce` `synthetic-monitoring` `playwright` `ecommerce` `checkout` `uptime-monitoring` `nestjs` `bullmq` `vue3` `self-hosted` `observability` |
| **scopelock** (new; repo not created yet, see blockers) | Push the local repo; social preview from `docs/landing.png`; add a GitHub Action running `npm test` | "Get clients to sign off on scope. Then hold them to it." | New sign-off → client accepts/rejects → receipt → change request showing the CHANGED/ADDED diff (the `docs/*.png` frames are ready) | `agency` `freelance` `scope-creep` `uat` `sign-off` `hmac` `tamper-evident` `serverless` `vercel` `no-database` `project-management` |
| **shopify-ucp** | Fix the 9 known issues first (P3 list), add the read-only MCP playground. **Don't promote until the playground works** | "Make any Shopify store callable by AI agents over MCP." | Agent asks "waterproof jackets under $150" → `tools/call` trace → products | `mcp` `model-context-protocol` `shopify` `shopify-app` `ai-agents` `agentic-commerce` `remix` `polaris` |
| **sun-ui** | Register the npm scope and publish 0.1.0; add a "SaaS settings screen" example; link Storybook in the About box | "26 MUI v7 components, one variant/color/size API, light and dark tokens." | Change the variant prop across components → toggle dark mode → token table | `react` `mui` `design-system` `component-library` `storybook` `design-tokens` `typescript` `dark-mode` |
| **promptpay-storefront** | QR preview is live (PR #6). Add a "WooCommerce plugin waitlist" CTA plus a Stripe link | "PromptPay QR payments for WooCommerce, with exact totals, slip upload and duplicate-slip rejection." | Type a PromptPay ID and amount → QR renders → scan it on a phone | `promptpay` `thailand` `woocommerce` `qr-code` `emvco` `payments` `wordpress-plugin` |
| **gmail-auto-unsubscribe** | PR #6 merged (demo GIF). Submit to the Chrome Web Store ($5 developer fee, owner); add a privacy section near the top | "Unsubscribe from every Gmail newsletter in one click, without the extension ever reading your mail." | The existing 15 s run GIF | `chrome-extension` `gmail` `unsubscribe` `privacy` `manifest-v3` `productivity` `email` |

---

## 4. Launch kit for ScopeLock (drafts; the owner posts)

> Before posting: (1) the owner approves Stripe live mode, then the live links replace the `STRIPE_LINK_*` env values; (2) enable Web Analytics; (3) the GitHub repo is public; (4) optionally a custom domain (for example `scopelock.app`, check price first).

### Product Hunt
- **Name:** ScopeLock
- **Tagline (≤ 60):** Client sign-off on scope and UAT, with tamper-evident receipts
- **Topics:** Productivity, Freelance, SaaS, Developer Tools
- **Description (≤ 260):** Turn your SOW checklist into a link. Clients accept or reject each item and sign, and you both get an HMAC-signed receipt that anyone can verify. New asks become change requests that show exactly what changed. Free, with no signup and no database.
- **Gallery:** `docs/landing.png`, `new.png`, `sign.png`, `receipt.png`, `change-request.png`, plus the GIF
- **Maker comment:**
  > Hi PH! I'm Tahmid, a lead full-stack engineer in Bangkok. I've spent years shipping fixed-price projects for agencies, and the most expensive sentence in that work is "I thought that was included."
  >
  > So I built ScopeLock. You list what's in scope, the UAT checks, and what's explicitly out. Your client gets a link, ticks every item (a rejection needs a comment), acknowledges the exclusions, and signs. You both get a receipt that's cryptographically signed: change one character and verification fails.
  >
  > The part I like most: when the client comes back with "one small thing", you start a change request from the signed receipt, and they see the diff against what they already approved.
  >
  > The free tier stores nothing. The whole document lives in the link's URL fragment. Pro (saved workspace, email alerts, branding, PDF) is in early access at $19/mo, locked for life.
  >
  > I'd love feedback from anyone who's lived through scope creep. What would you need before you'd send this to a client?

### Show HN
- **Title:** Show HN: ScopeLock – Scope sign-off links with HMAC receipts and no database
- **Body:**
  > I run fixed-price web projects, and most disputes come down to "was that in scope?". ScopeLock is a small tool for that: the agency lists in-scope items, UAT checks and exclusions; the client gets a link, accepts or rejects each one and signs; both keep a signed receipt.
  >
  > Implementation, since HN will ask: there's no database. The document is JSON, base64url-encoded and HMAC-SHA256-signed by the server (`v1.<payload>.<mac>`), and it lives in the URL fragment, so it never hits server logs. Signing returns a receipt token that embeds the document, its SHA-256, the decisions, a timestamp, the country and a UA hash, signed the same way. "Verify" recomputes the MAC. A change request embeds the parent receipt's hash and items, so the client sees a diff against the baseline.
  >
  > Known limits: signer identity is self-declared (no OTP yet), and rotating the server secret invalidates old links unless I add key IDs, which is next. It's a record of agreement, not a qualified e-signature.
  >
  > Static HTML plus four Node functions on Vercel, about 500 lines, MIT: github.com/tahmidbintaslim/scopelock. Live: https://scopelock-sable.vercel.app
  >
  > I'd especially like critique of the threat model, and to hear whether "stateless" is a feature or a footgun for something like this.

### X thread
1. Most agency disputes come down to one sentence: "I thought that was included." I built a free tool to end that argument. ScopeLock: client sign-off on scope and UAT, with tamper-evident receipts. 🧵 [GIF]
2. You list what's in scope, the UAT checks, and what's explicitly out. The client gets a link and accepts or rejects every item. A rejection needs a comment, and exclusions need an explicit "acknowledged".
3. When they sign, you both get a receipt that's HMAC-signed by the server. Change one character and verification fails, and anyone can verify it.
4. The part I'm proudest of: "one more small thing?" Start a change request from the signed receipt, and the client sees exactly what was added or changed against what they already approved. [change-request.png]
5. The free tier stores nothing. The whole doc lives in the URL fragment: no DB, no signup, no client login.
6. Free forever for links and receipts. Pro (workspace, email alerts, branding, PDF) is in early access at $19/mo, locked for life. Try it: https://scopelock-sable.vercel.app. Code (MIT): github.com/tahmidbintaslim/scopelock

### LinkedIn
> Scope creep isn't a client problem. It's a paperwork problem.
>
> After years of leading fixed-price builds, I noticed the expensive disputes never came from bad intent. They came from "I thought that was included," plus a PDF nobody re-read.
>
> So I built ScopeLock, a free tool that turns your scope and UAT checklist into a sign-off link:
> ✅ the client accepts or rejects every item (a rejection needs a comment)
> ✅ exclusions must be explicitly acknowledged
> ✅ both sides get a tamper-evident, cryptographically signed receipt
> ✅ every later request becomes a change request with a clear diff
>
> No signup, and no database on the free tier. The document lives in the link.
>
> If you run an agency or freelance, I'd value your honest feedback: would you send this to a client? 👉 https://scopelock-sable.vercel.app
>
> #freelancing #agency #projectmanagement #webdevelopment #buildinpublic

### Claude / MCP directories
ScopeLock is **not an MCP server** today, so don't list it. A good follow-up (about 1 day of work): a small `scopelock-mcp` server with `create_signoff(items)` and `verify_receipt(url)` tools, so agents drafting SOWs can mint sign-off links. Once it exists, list it on the official MCP Registry (registry.modelcontextprotocol.io), mcp.so, Smithery and Glama. **shopify-ucp** is the repo that genuinely fits these directories, after its playground works.

### Launch-day checklist (ScopeLock)
**T-7 to T-2 days**
- [ ] Owner approves Stripe live mode → create live Payment Links → update `STRIPE_LINK_PRO` and `STRIPE_LINK_AGENCY` → redeploy → do one real $19 purchase and refund it
- [ ] Vercel → scopelock → Analytics → **Enable Web Analytics** (and redeploy)
- [ ] Create a public `tahmidbintaslim/scopelock` repo, push, set topics, social preview, About link
- [ ] Record the 20 s GIF (the flow from the screenshots); make a 1270×760 PH thumbnail
- [ ] Optional: buy a domain and add it to the project; update the Stripe redirect URLs
- [ ] Schedule PH for **Tuesday–Thursday, 00:01 PT** (14:01 Bangkok); line up 10 people to try it and comment honestly (no vote-begging)

**Launch day (Bangkok times)**
- [ ] 14:01: PH goes live → post the maker comment
- [ ] 14:15: X thread, LinkedIn post (link in the first comment if reach drops)
- [ ] 20:00–21:00 (US morning): Show HN. Stay to answer every comment for 3 hours, with technical answers and no marketing tone
- [ ] Every 2 h: check Vercel runtime errors and logs, the waitlist count (Blob `waitlist/`), Analytics events
- [ ] Reply to every PH and HN comment within 30 min

**T+1 to T+7**
- [ ] Email waitlist sign-ups personally (first 50) and ask for a 15-min call
- [ ] Post a "what I learned" follow-up on X/LinkedIn with real numbers
- [ ] Decide on the Pro build go/no-go: ≥10 paid early-access or ≥50 Pro/Agency waitlist sign-ups → build the workspace and email notifications
