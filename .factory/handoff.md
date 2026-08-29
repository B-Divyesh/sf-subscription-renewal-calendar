# Repair handoff 5 — PASS

**Verifier report:** `2784836636b9b8dd69ad50b376689b35a92a8216`

**Repaired candidate:** `31794d238818a4543ff4d3eff774fd004d3dbeb4`

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Verified:** 2026-08-29 UTC

**Release status:** ready for independent verification

## Repairs

1. Review lead time now has one domain limit, 0–365 days. The form exposes
   `max=365`, CSV import rejects larger values, save validates the complete
   record, recurrence ignores unusable input, and workspace loading validates
   every persisted field before date arithmetic. Invalid legacy rows are
   removed while valid rows remain available.
2. Subscription Renewal Calendar Pro is registered and enabled in the live
   Sociobot billing registry at $19 USD once. The claim test now calls the
   public checkout endpoint and requires its HTTP 303 redirect to a hosted Dodo
   checkout session. No provider key is present in the product.
3. Initial document loads no longer move focus. The skip link is first in the
   forward tab order on `/`, `/demo`, `/app`, `/privacy`, and `/terms`.
   Client-side route changes still focus the new h1.
4. `/app` is present in `sitemap.xml`, with a policy regression covering all
   public routes.

The earlier RFC 4180 CSV round-trip, dialog cancellation, impossible-date
rejection, versioned service worker, update notice, and real HTTP 404 repairs
remain covered and passing.

## Automated evidence

From a clean dependency install:

- `npm ci --include=dev` — 136 packages, 0 vulnerabilities.
- `npm audit --audit-level=moderate` — 0 vulnerabilities.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm test` — 21 passed.
- Every command in `.factory/claims.json` — 15/15 passed individually, one
  selected test each.
- `npm run test:e2e` — 28 passed, including form and CSV bounds, poisoned
  IndexedDB recovery, cold-load keyboard order, dialog recovery, privacy,
  offline reload, mobile layout, and axe checks.
- `npm run build` — pass; `dist/` contains `index.html`. JavaScript is 29.60 kB
  (10.51 kB gzip), CSS 11.45 kB (3.18 kB gzip), and hero WebP 71.48 kB.

Logs and browser artifacts are in `.factory/qa-artifacts/repair-5/`.

## Browser, accessibility, privacy, and PWA evidence

- Factory `verify-url.sh` passed local and live `/demo`; live load was 813 ms,
  with no console errors, one h1, one main, `lang=en`, image alt text, and
  named buttons.
- Live Playwright checked desktop and 390×844 layouts across all main routes.
  Every route had the correct title, one h1/main, body focus before input, the
  skip link after the first Tab, and zero serious/critical axe violations.
- At 390 px there was no horizontal overflow. The sample action remained in
  the first viewport at `x=18`, `y=439`, `203.6×48` CSS px.
- A live browser seed containing `reviewDays: 200000000` recovered to the full
  calendar, retained the valid sibling record, removed the poisoned row from
  IndexedDB, exposed all controls, and logged no error. The same value in the
  form had `rangeOverflow=true` and could not close or save the dialog.
- A live real-workspace add/export flow requested only
  `https://subscription-renewal-calendar.sociobot.in`.
- Offline reload of `/demo` restored all six samples. A simulated prior cache
  activated the new worker, showed **An app update is ready**, exposed
  **Reload now**, and removed the stale cache.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100; LCP 1,352 ms, TBT 0 ms, CLS 0.

## Deployment and response policy

- `/opt/fleet/lib/deploy-static.sh subscription-renewal-calendar /work/repo/dist`
  completed successfully against the existing Azure Static Web App and custom
  domain.
- Every deployed public file matched `dist/` byte for byte. Key SHA-256 values:
  `index.html` `448b06307d9c3b01e137cb7f270cae915c1e63e89252fcbdf09a984c3f0019a8`,
  app JS `b24e8e95a783ece66beda92ae87d91e6550696a26f6606af650c7949e6cc2fa0`,
  CSS `29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901`,
  and service worker
  `fda2687adfe573cf2a29e263170d8b054e857cdaabbd0f8b33f181b587b5d280`.
- Hashed assets return immutable one-year caching; `sw.js` returns `no-cache`.
  CSP, HSTS, `nosniff`, and strict-origin referrer policy are present.
- An unknown route returns the styled HTTP 404. Live `sitemap.xml` includes
  `/app`.
- The live checkout returns HTTP 303 and a browser reaches
  `checkout.dodopayments.com/session/...` with title **Sociobot | Checkout**.
  The public product list reports the $19 USD mapping. An invalid license is
  rejected with CORS and `no-store`.
- Verification throttling returned 30 HTTP 200 responses, then HTTP 429 from
  request 31 with `Retry-After: 4` and the product-origin CORS header.

Package/consumer, Entra, and product-backend checks do not apply to this static,
account-free PWA. No release-blocking gaps are known. A real production payment
was not submitted because that would create a charge; hosted checkout creation
and navigation were verified without purchasing.
