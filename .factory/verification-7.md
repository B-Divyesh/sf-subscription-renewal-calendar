# Independent verification 7 — FAIL

**Date:** 2026-08-29 UTC

**Candidate:** `262cc4ef2209d3449979f7857196a1e831321f56`

**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Result:** **FAIL — do not release**

The live static deployment matches the candidate and the core local-first
calendar is healthy. The release still fails because the paid checkout return
path stores a valid license without verifying or activating it. A buyer can
reach the hosted $19 checkout successfully, but the product does not deliver
the purchased Pro forecast when the buyer returns with `?license=<token>`.

## Mandatory first checks

### First-read and one-click demo — PASS

A cold, storage-free live visit returned HTTP 200 and showed:

> See renewals before they charge. For small teams that need a cost, owner,
> and decision before every recurring charge. Try it with sample data.

This plainly states what the product does, who it serves, and what to click.
There is exactly one sample-data action. One click opened `/demo`, immediately
showed six subscriptions and 17 current renewal occurrences, and displayed the
persistent **Demo — sample data, nothing is saved** banner with **Reset demo**
and **Start for real**.

### Claims — 15/15 PASS after clean install

The required `.factory/claims.json` exists. A literal pre-install invocation
could not load the uninstalled local Playwright package and did not reach any
product assertion. After the required `npm ci`, every declared command was run
individually from the candidate; each selected one tagged browser test and
passed.

| Claim | Exact declared command | Result |
| --- | --- | --- |
| `weekly-occurrences` | `npm run test:e2e -- --grep @claim:weekly-occurrences` | PASS — 1 test |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS — 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1 test |
| `private-data` | `npm run test:e2e -- --grep @claim:private-data` | PASS — 1 test |
| `ics-export` | `npm run test:e2e -- --grep @claim:ics-export` | PASS — 1 test |
| `sixty-day-window` | `npm run test:e2e -- --grep @claim:sixty-day-window` | PASS — 1 test |
| `csv-roundtrip` | `npm run test:e2e -- --grep @claim:csv-roundtrip` | PASS — 1 test |
| `encrypted-backup` | `npm run test:e2e -- --grep @claim:encrypted-backup` | PASS — 1 test |
| `pro-forecast` | `npm run test:e2e -- --grep @claim:pro-forecast` | PASS — 1 test |
| `delete-all` | `npm run test:e2e -- --grep @claim:delete-all` | PASS — 1 test |
| `device-storage` | `npm run test:e2e -- --grep @claim:device-storage` | PASS — 1 test |
| `pro-price` | `npm run test:e2e -- --grep @claim:pro-price` | PASS — 1 test; return-path gap below |
| `cost-history` | `npm run test:e2e -- --grep @claim:cost-history` | PASS — 1 test |
| `high-value-warning` | `npm run test:e2e -- --grep @claim:high-value-warning` | PASS — 1 test |
| `verified-license-offline` | `npm run test:e2e -- --grep @claim:verified-license-offline` | PASS — 1 test |

The registry consistency test confirms one and only one tagged browser test
for every declared claim. Public copy and README claims map to the registry.
The paid-return behavior required by the paid-unlock contract is not covered:
the price test stops at hosted-checkout creation, while forecast tests paste a
token manually and mock verification.

## Release-blocking defect

### P1 — a license returned from checkout is not verified or activated

Fresh live reproduction with the verification endpoint intercepted to return
`{ valid: true, reason: "ok" }`:

1. Open `/?license=valid-paid-return-qa` in a new browser context.
2. The product strips the query parameter and stores the token, as expected.
3. It also writes
   `{"valid":false,"checkedAt":1788013185751}` to the cached verdict.
4. It makes **zero** verification requests.
5. Navigate to the populated demo. Verification requests remain at zero, the
   12-month forecast remains locked, the license field is blank, and no notice
   explains how to recover.

The same result occurs when `/demo?license=...` is opened directly: the page
says **License saved. Verify it to activate Pro**, but does not make the
verification request and does not prefill the token. The freshly written
`checkedAt` timestamp causes background reconciliation to skip verification
for 24 hours.

Impact: the real checkout is available and advertises instant license delivery,
but the normal return URL cannot activate the purchase. This violates the
required first-unlock verification and return-token flow. It is a candidate
defect, not a deployment-only failure, because the live application bytes are
identical to the fresh build.

## Clean-clone quality gates

```text
npm ci                           PASS — 136 packages, 0 vulnerabilities
npm audit --audit-level=moderate PASS — 0 vulnerabilities
npm run typecheck                PASS
npm run lint                     PASS
npm test                         PASS — 2 files, 21 tests
npm run test:e2e                 PASS — 28 tests
npm run build                    PASS — dist/ produced
claims.json commands             PASS — 15/15, one selected test each
```

Production output is within the static-PWA budgets:

```text
JavaScript    29.60 kB / 10.51 kB gzip
CSS           11.45 kB /  3.18 kB gzip
Hero WebP     71.48 kB
```

## Independent product exercise

- Normal/local persistence: added a monthly EUR renewal, reloaded, edited the
  amount, owner data, review lead time, and decision, then reloaded again. The
  record and cost history persisted.
- Boundaries: amount `0` and review lead time `365` saved. Lead time `366`
  produced native range validation, kept the dialog open, and did not persist.
- Invalid input and recovery: an unsupported currency produced the specific
  row error; a valid quoted CSV imported immediately afterward.
- CSV/ICS: live exports contained the expected quoted records; ICS contained
  65 events for the exercised records and escaped the comma in the name.
- Deletion: confirmed one-record deletion and restored it with **Undo**.
- Encrypted backup: the live download contained only `version`, `salt`, `iv`,
  and ciphertext, leaked no sample names, decrypted all six samples with the
  supplied passphrase, and rejected the wrong passphrase.
- Recurrence unit coverage independently includes multiple weekly occurrences,
  month-end clamping from the 31st, leap/calendar validation, and UTC date-only
  behavior across daylight-saving boundaries.

## Accessibility, mobile, and browser quality

- Fresh live audits covered `/`, `/demo`, `/app`, `/privacy`, and `/terms` at
  1440×1000 and 390×844. Every route had `lang=en`, one h1, one main, the
  correct route title, zero horizontal overflow, and no missing image alt text.
- Axe reported zero serious or critical findings on all ten route/viewport
  combinations. The repository's full axe regression suite also passed.
- Cold focus remained on the body. The first Tab reached **Skip to content**
  on every route with a visible solid 4 px coral outline. No visible mobile
  interactive target was smaller than 44×44 CSS px.
- The named native dialog moved focus inside, Escape closed it and restored
  focus to **Add subscription**, and invalid submission kept the dialog open.
- Reduced-motion mode reported `0s` occurrence transitions.
- The factory `verify-url.sh` passed live `/demo`: 753 ms load, no console
  errors, one h1/main, `lang=en`, complete alt text, and named buttons.
- Normal desktop/mobile route loads and the full live data flow produced no
  console errors or page errors.

## Privacy, response policy, billing, and routing

- A fresh live real-workspace add/edit/import/export/delete flow requested only
  the product origin. Landing and demo loads also requested only same-origin
  HTML, JS, CSS, and imagery. There are no analytics, trackers, bank controls,
  CDN fonts, or cross-origin subscription-data calls.
- Billing is the sole intentional external runtime integration. The product
  list reports **Subscription Renewal Calendar Pro**, USD 1900 minor units.
  The public checkout returned HTTP 303, and a browser reached a hosted Dodo
  session titled **Sociobot | Checkout** showing a one-time $19 total. No real
  payment was submitted.
- Billing verification allowed 30 requests from one client. Request 31 and the
  next two returned HTTP 429 with `Retry-After: 4` and the product-origin CORS
  header. Successful verification responses used `Cache-Control: no-store`.
- Root and app routes send CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, and strict-origin referrer policy. Hashed
  assets use one-year immutable caching; `sw.js` uses `no-cache`.
- An unknown route returned the styled **Page not found** document with real
  HTTP 404. `sitemap.xml` lists `/`, `/demo`, `/app`, `/privacy`, and `/terms`.
- Chromium parsed the manifest with no errors and reported no installability
  errors.

## PWA and performance

- The live service worker controlled `/demo`; a full offline reload restored
  all six samples and 17 current occurrences.
- A real two-version test first installed a worker using
  `renewal-ledger-independent-old`, then served the exact candidate build. The
  candidate activated, replaced the cache with `renewal-ledger-600206bdf74c`,
  and displayed **An app update is ready** with **Reload now**.
- Three Lighthouse 12.6 mobile runs scored Performance **89, 96, 100**
  (median 96), Accessibility **100**, Best Practices **100**, and SEO **100**.
  Median LCP was 1,369 ms, CLS was 0, and first-load transfer was about 88 kB.
  A 4× CPU-throttled interaction sample measured a maximum 56 ms event
  duration, below the 200 ms interaction budget.

Fresh SHA-256 comparison matched every deployable public artifact in `dist/`
to the live domain. Key hashes:

```text
index.html  448b06307d9c3b01e137cb7f270cae915c1e63e89252fcbdf09a984c3f0019a8
app JS      b24e8e95a783ece66beda92ae87d91e6550696a26f6606af650c7949e6cc2fa0
CSS         29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
sw.js       fda2687adfe573cf2a29e263170d8b054e857cdaabbd0f8b33f181b587b5d280
```

The static deployment config is intentionally consumed by the host rather
than served as a public file. Library/CLI consumer, product-backend
concurrency/persistence/health, and Entra sign-in checks do not apply to this
account-free static PWA. No AI feature is implied by the brief's local
recurrence and export job.

## Required repair

On receipt of a `license` query token, save and strip it, then immediately
verify it. Do not write a fresh `checkedAt` value that suppresses that first
verification. On a valid response, cache the valid verdict and show Pro; on a
failed response, keep the free calendar available with an actionable notice.
Add a browser regression that starts at `/?license=<token>`, mocks a valid
Sociobot response, asserts one verification request, and asserts the unlocked
forecast after navigation/reload.
