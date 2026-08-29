# Independent verification 8 — PASS

**Candidate:** `5fb81522f0856d8f9db204cb494819f42dbf170e`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Verified:** 2026-08-29 UTC
**Result:** **PASS — release candidate accepted**

The live deployment is the candidate build, not a stale deployment-only
variant: SHA-256 matched local `dist/` for `index.html`, JS, CSS, hero image,
service worker, and manifest. This candidate resolves verification 7's
checkout-return defect; the clean local 30-test browser suite covers immediate
successful checkout-return verification and retry recovery.

## Mandatory first checks

### Cold first read — PASS

A cold live visit stated: **“See renewals before they charge.”** It says it is
for **“small teams that need a cost, owner, and decision before every recurring
charge”** and presents **“Try it with sample data”** as the primary first click,
with “Loads a working 60-day calendar” beside it. One click opens `/demo`,
showing six realistic subscriptions and the persistent **Demo — sample data,
nothing is saved** banner with **Reset demo** and **Start for real**.

### Claims registry — PASS (15/15)

`.factory/claims.json` exists and was read after `npm ci`. Every exact declared
command was run separately from this clean candidate, using its browser demo
entry point; each selected test passed. A full `npm run test:e2e` immediately
afterward also passed all 30 tests.

| Claim | Exact declared command | Result |
| --- | --- | --- |
| `weekly-occurrences` | `npm run test:e2e -- --grep @claim:weekly-occurrences` | PASS |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `private-data` | `npm run test:e2e -- --grep @claim:private-data` | PASS |
| `ics-export` | `npm run test:e2e -- --grep @claim:ics-export` | PASS |
| `sixty-day-window` | `npm run test:e2e -- --grep @claim:sixty-day-window` | PASS |
| `csv-roundtrip` | `npm run test:e2e -- --grep @claim:csv-roundtrip` | PASS |
| `encrypted-backup` | `npm run test:e2e -- --grep @claim:encrypted-backup` | PASS |
| `pro-forecast` | `npm run test:e2e -- --grep @claim:pro-forecast` | PASS |
| `delete-all` | `npm run test:e2e -- --grep @claim:delete-all` | PASS |
| `device-storage` | `npm run test:e2e -- --grep @claim:device-storage` | PASS |
| `pro-price` | `npm run test:e2e -- --grep @claim:pro-price` | PASS |
| `cost-history` | `npm run test:e2e -- --grep @claim:cost-history` | PASS |
| `high-value-warning` | `npm run test:e2e -- --grep @claim:high-value-warning` | PASS |
| `verified-license-offline` | `npm run test:e2e -- --grep @claim:verified-license-offline` | PASS |

## Clean-checkout quality gates

```text
npm ci                 PASS — 136 packages installed; 0 audit vulnerabilities
npm test               PASS — 21 tests in 2 files
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS — dist/ produced
npm run test:e2e       PASS — 30 Playwright tests
```

Production output is within the static-PWA budget: JS 29.87 kB (10.57 kB
gzip), CSS 11.45 kB (3.18 kB gzip), and hero WebP 71.48 kB.

## Independent live exercise

- Added a monthly EUR renewal through the dialog; it appeared in the calendar
  and exports. CSV, ICS, and password-protected encrypted-backup downloads all
  completed. The CSV error for `2026-02-30` was specific and recoverable.
- A real-workspace sentinel remained absent in demo. Reset demo restored
  exactly six original sample subscriptions and removed the test item.
- The live demo was controlled by `/sw.js`; after the first visit an offline
  reload restored the calendar. A controller message showed **An app update is
  ready** and **Reload now**.
- Browser request logging during a normal add/export demo flow saw only
  `https://subscription-renewal-calendar.sociobot.in`. No analytics, bank,
  tracker, or cross-origin subscription-data request occurred. License
  verification is the explicit Sociobot billing integration.
- Live `/`, `/demo`, `/app`, `/privacy`, and `/terms` each returned 200 with
  one h1 and one main, correct title and `lang=en`, no page/console errors, and
  zero axe serious/critical findings in Playwright. At 390×844 there was no
  horizontal overflow and no visible target smaller than 44×44 px. Keyboard
  Tab first reached the visible skip link; reduced-motion duration was `0s`.
- The repository has no `verify-url.sh`; its required title/lang/main/alt/
  console checks were independently covered. `@axe-core/cli` could not start
  Selenium Chrome in this container, but the repository's Playwright axe
  integration and independent live Playwright axe audits passed.
- Lighthouse CLI could not attach to the preinstalled Playwright Chromium;
  performance evidence is the production bundle measurement above, not a
  fresh Lighthouse score.

## Deployment, headers, and billing

Live/local artifact hashes matched exactly:

```text
index.html  86f4b6a41292968446d19c0fdc70c5289795ce46fdac2854917d164185e9b518
app JS      3a5a653c349f9fff97cb641a39244e2ef61207399824867402a57b303970830a
CSS         29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
sw.js       a0989fc016e383ab92b9461b1c5aa8bb4defbe5d8c52d12f363acb560a87b57d
```

The root sends CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and
`strict-origin-when-cross-origin`. Hashed assets are one-year immutable;
`sw.js` is `no-cache`; the unknown-route page is a styled HTTP 404.

The $19 checkout endpoint returned HTTP 303 to hosted Dodo. The product verify
endpoint returned 200 for 30 consecutive invalid-token requests, then request
31 returned **429** with **`Retry-After: 4`**; observed allowance: 30 requests
per client/window. This static PWA has no product backend, sign-in, AI, CLI,
or library API to test.

## Defects

No P0, P1, P2, or P3 product defects found. No production payment was
submitted; hosted-checkout creation and checkout-return behavior were verified
without charging a card.
