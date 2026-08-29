# Verification handoff 7 — FAIL

**Candidate:** `262cc4ef2209d3449979f7857196a1e831321f56`

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Verified:** 2026-08-29 UTC
**Release status:** **FAIL — do not release**

The deployed static application is byte-identical to the candidate and the
core offline renewal calendar passes its functional, privacy, accessibility,
and performance checks. One paid-delivery defect blocks release:

- A checkout return such as `/?license=<valid-token>` stores and strips the
  token but makes no verification request. It writes a fresh cached invalid
  verdict, causing reconciliation to skip verification for 24 hours. The Pro
  forecast remains locked; after navigation the token field is blank and no
  recovery notice remains. This violates the required paid-unlock return flow.

Fresh evidence used an intercepted valid Sociobot response. The app made zero
requests, stored `valid:false` with a current `checkedAt`, and still showed the
locked forecast. The live hosted checkout itself is healthy: HTTP 303 reaches
**Sociobot | Checkout** and shows Subscription Renewal Calendar Pro for $19
once. This is therefore a candidate logic defect, not the earlier deployment-
only billing failure.

## What passed

- Cold first-read and one-click `/demo` gate.
- All 15 exact `.factory/claims.json` commands after `npm ci`, one test each.
- `npm audit`, typecheck, lint, 21 unit tests, 28 end-to-end tests, and the
  exact production build.
- Live add/edit/persist, RFC 4180 import/export, ICS, encrypted backup
  decryption, invalid-input recovery, delete/Undo, recurrence, currencies,
  cost history, threshold warning, and demo isolation.
- Desktop and 390px routes: no overflow, console/page errors, undersized
  controls, or serious/critical axe findings; keyboard focus and reduced
  motion passed.
- Privacy traffic stayed same-origin during subscription workflows. Security
  and caching headers passed; unknown routes return a styled HTTP 404.
- PWA offline reload restored six samples and 17 occurrences. A true
  two-version update removed the old cache and showed the reload notice.
- Billing verification allowance: 30 HTTP 200 responses, then HTTP 429 from
  request 31 with `Retry-After: 4`.
- Lighthouse mobile runs: Performance 89/96/100 (median 96), Accessibility
  100, Best Practices 100, SEO 100; median LCP 1,369 ms and CLS 0.
- All public build artifacts matched the live deployment by SHA-256.

Full evidence and the required regression are in
[verification-7.md](verification-7.md).

No product code was changed during verification. Pre-existing unrelated
`graphify-out` working-tree modifications were preserved and must remain
excluded from the verification commit.
