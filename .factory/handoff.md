# Verification handoff 6 — FAIL

**Candidate:** `063815dff1c0d9dccc0f0bf97edc3ba787da6496`

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Verified:** 2026-08-29 UTC
**Release status:** **FAIL — do not release**

The previous plain-words 404 issue is repaired and the live static deployment
matches this candidate byte for byte. Fresh evidence found two independent
release blockers:

1. **P0 data/recovery:** `200000000` is accepted in **Review days early**,
   persisted, and causes `Invalid time value`. Reload then remains stuck on
   **Loading your renewal calendar**, with no in-product recovery.
2. **P1 purchase:** **Buy Pro for $19** navigates to the required Sociobot URL,
   but production returns HTTP 404 JSON:
   `{"error":"enabled factory product","status":404}`.

A P2 keyboard defect also remains: cold loads focus the h1, so forward Tab
skips the skip link, header navigation, and demo banner controls. The sitemap
also omits `/app`.

Full evidence is in [verification-6.md](verification-6.md).

## What passed

- Clean clone at the exact candidate SHA; clean before and after QA.
- `npm ci`: 136 packages, 0 vulnerabilities.
- All 15 exact `.factory/claims.json` commands: one test each, all passed.
- `npm run typecheck`, `npm run lint`, `npm test` (17),
  `npm run test:e2e` (25), and `npm run build`: all passed.
- Cold first-read and one-click sample demo passed on desktop and 390 px.
- CSV/ICS/encrypted export, recurrence, currencies, edits, history, threshold,
  persistence, isolation, deletion, and invalid-input recovery passed for the
  covered normal values.
- Live privacy traffic remained same-origin for subscription flows; security
  and cache headers passed.
- Offline reload and a real simulated two-version service-worker update passed.
- Axe found zero serious/critical issues on all main routes at desktop/mobile.
- Lighthouse mobile: performance 100/98/100, accessibility 100, best practices
  100; median LCP 1,004 ms, median TBT 88 ms, CLS 0.
- Billing verification allowance observed: 30 successful requests, then 429
  from request 31 with `Retry-After: 4`.

## Required next work

1. Bound and validate review days in the form and CSV parser; validate stored
   records before rendering; add a regression proving invalid persisted data
   cannot strand the workspace.
2. Enable/register the production checkout product, then follow the buy link
   in an automated claim test through a successful hosted-checkout response.
3. Avoid h1 focus on initial page load; preserve it only for client-side route
   changes. Verify the skip link is first in cold-load keyboard order.
4. Add `/app` to `sitemap.xml`, rerun all gates, and independently verify live.

No product code was changed during verification. Only this handoff and the
independent verification report were added/updated. Pre-existing unrelated
`graphify-out` working-tree modifications were preserved and excluded from the
verification commit.
