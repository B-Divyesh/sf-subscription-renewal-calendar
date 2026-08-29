# Independent verification 6 — FAIL

**Date:** 2026-08-29 UTC

**Candidate:** `063815dff1c0d9dccc0f0bf97edc3ba787da6496`

**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Result:** **FAIL — do not release**

The main static deployment is byte-identical to the candidate and the normal
calendar workflows are healthy. This is still a release failure: one accepted
form value permanently breaks the user's local calendar, and the advertised
$19 purchase link returns JSON HTTP 404 instead of checkout. A separate
keyboard-order defect also violates the required accessibility baseline.

## Mandatory first checks

### First-read and one-click demo — PASS

A cold live visit at desktop and 390×844 returned HTTP 200. The first viewport
says:

> See renewals before they charge. For small teams that need a cost, owner,
> and decision before every recurring charge. Try it with sample data.

This plainly states what the product does, who it is for, and what to click.
At 390 px the action occupied `x=18, y=439, w=203.6, h=48`, wholly inside the
first viewport. One click opened `/demo`, showed the persistent
`Demo — sample data, nothing is saved` banner with Reset and Start-for-real
controls, six subscriptions, and 17 occurrences in the current 60-day window.

### Claims — all declared commands PASS

`.factory/claims.json` exists. In a separate clean clone checked out at the
exact candidate SHA, `npm ci` completed and every declared command was run
individually. Each selected exactly one Playwright test and passed:

| Claim | Exact command | Result |
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
| `pro-price` | `npm run test:e2e -- --grep @claim:pro-price` | PASS — inadequate live coverage; see P1 |
| `cost-history` | `npm run test:e2e -- --grep @claim:cost-history` | PASS — 1 test |
| `high-value-warning` | `npm run test:e2e -- --grep @claim:high-value-warning` | PASS — 1 test |
| `verified-license-offline` | `npm run test:e2e -- --grep @claim:verified-license-offline` | PASS — 1 test |

The registry/test consistency check also passed: there is exactly one
`@claim:<id>` test per declared claim. The `pro-price` test only checks the
checkout URL string; it never follows the public link, so it misses the live
failure below and does not prove the observable purchase claim.

## Release-blocking defects

### P0 — an accepted review-day value poisons persistent data and breaks reload

The add form's **Review days early** number input has `min=0` and `step=1`, but
no upper bound or domain validation. In a fresh live real workspace:

1. Add `Huge review poison`, amount `10`, owner `Rae`.
2. Enter `200000000` for Review days early. Chromium reports the field valid
   with an empty validation message.
3. Choose **Save subscription**.

The value is saved to IndexedDB before recurrence rendering calls
`toISOString()` for the out-of-range review date. The browser then reports
`Invalid time value`. After reload, the app reports the same page error and
never advances beyond **Loading your renewal calendar**. No delete, edit,
export, or recovery control is available, so a normal user must clear all site
data and lose valid subscriptions.

The same unsafe value is accepted by CSV parsing because it checks only for a
non-negative integer. `loadWorkspace()` also considers it usable, so its
legacy-data filter does not recover the workspace. Bound review days to a
business-safe maximum and validate both form/CSV input and stored rows before
date arithmetic.

### P1 — the advertised Pro purchase cannot start

Both live **Buy Pro for $19** links target the contractually correct URL:

```text
https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/checkout
```

A real browser click navigated there and received:

```text
HTTP 404
Content-Type: application/json
{"error":"enabled factory product","status":404}
```

The buyer sees raw JSON, not hosted checkout. This contradicts the landing,
terms, README, and `pro-price` claim. The static deployment matches the
candidate, while the failure is in production billing enablement; regardless
of ownership, the candidate/live product cannot be accepted until the product
is enabled and the end-to-end link is tested.

### P2 — initial focus skips the skip link and controls before the h1

Every route performs an asynchronous workspace load even when it does not need
one. The second render treats this initial load as a route change and focuses
the h1 (`tabindex=-1`). On cold `/`, `/demo`, and `/app`, focus was already on
the h1 before user input.

- On `/`, the first forward Tab went directly to **Try it with sample data**.
- On `/demo`, it went directly to **Add subscription**.
- The skip link, header navigation, and demo **Reset demo** / **Start for real**
  controls were skipped in forward order. They are reachable only by moving
  backwards or wrapping through the entire page.

Focus rings on reached controls are visible and there is no trap, but the skip
link is not first as required and important demo controls are bypassed. Do not
move focus on the initial document load; retain h1 focus only for genuine
client-side route changes.

### P2 — sitemap omits a public route

`/app` is a linked, independently titled application route, but
`public/sitemap.xml` lists only `/`, `/demo`, `/privacy`, and `/terms`. The
site-structure contract requires every real route in the sitemap.

## Clean-clone quality gates

The independent clone was clean before and after the following commands:

```text
npm ci                           PASS — 136 packages, 0 vulnerabilities
npm audit --audit-level=moderate PASS — 0 vulnerabilities
npm run typecheck                PASS
npm run lint                     PASS
npm test                         PASS — 2 files, 17 tests
npm run build                    PASS — dist/ produced
npm run test:e2e                 PASS — 25 tests
15 claims.json commands          PASS — one selected test each
```

Production output remains well inside the PWA budgets:

```text
JavaScript    28.61 kB / 10.22 kB gzip
CSS           11.45 kB /  3.18 kB gzip
Hero WebP     71.48 kB
```

## Independent product evidence

- Normal and boundary paths: required fields retained the dialog and exposed
  native messages; amount 0, review days 0, and a leap-day annual start saved;
  malformed amount/date/currency/quoted CSV rows produced specific errors;
  a valid quoted multiline CSV imported immediately afterward.
- Exports: CSV preserved comma, quote, and line-break fields. ICS had a valid
  calendar envelope, one event per occurrence, and escaped commas. A live
  encrypted backup contained only `version`, `salt`, `iv`, and ciphertext;
  PBKDF2/AES-GCM decryption with the supplied passphrase recovered all six
  exact sample subscriptions.
- Demo isolation: a real sentinel never appeared in demo; a demo edit never
  appeared in real data; leaving and returning restored the original sample.
- Currency totals remained separated. Cost history, threshold warnings,
  invalid-license locking, deletion, Undo, and browser persistence passed in
  the full suite.

## Accessibility, mobile, and performance

- Desktop and 390 px sweeps of `/`, `/demo`, `/app`, `/privacy`, and `/terms`
  each had `lang=en`, one h1, one main, correct route title, no horizontal
  overflow, no console/page errors, and zero axe serious/critical findings.
- The add dialog has an accessible name, focus enters it, Escape restores
  focus, and every dialog control is at least 44 px high. At 390 px every
  visible link, button, and file control measured at least 44×44 px.
- Reached keyboard controls used a designed solid 4 px focus outline. The
  initial-order defect is reported above.
- Reduced-motion mode produced `0s` occurrence transitions. The factory
  `verify-url.sh` passed live `/demo` with a 554 ms load and no errors.
- Three Lighthouse 12.6 mobile runs scored performance **100, 98, 100**,
  accessibility **100** throughout, and best practices **100** throughout.
  Median LCP was 1,004 ms, median TBT 88 ms, CLS 0, and compressed initial
  transfer about 16.6 kB.

## Privacy, headers, PWA, and endpoint policy

- Cold landing, demo, and the independent real add/import/export flow made
  only same-origin product requests. No analytics, tracker, bank, font-CDN,
  or cross-origin subscription-data request appeared. Billing verification is
  the only deliberate cross-origin runtime call tested.
- The live root sends CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`. Hashed assets use
  `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`.
- Unknown paths return a styled HTTP 404 with literal h1 **Page not found** and
  a recovery link. Chromium logs the expected failed-resource message for the
  deliberately requested 404 document; normal routes remain clean.
- The live service worker controlled `/demo`; a full offline reload restored
  all six samples and 17 current occurrences. A real two-version update test
  against the exact built artifact activated the new worker, removed old
  `renewal-ledger-*` caches, and displayed **An app update is ready** with
  **Reload now**. Chromium reported no manifest errors.
- The live verification endpoint allowed 30 rapid requests from one client.
  Request 31 and the next two returned 429; the first 429 included
  `Retry-After: 4` and the product-origin CORS header. Checkout cannot be
  meaningfully rate-limit-tested while every request returns 404.
- There is no sign-in and no product backend beyond Sociobot billing, so Entra,
  backend concurrency/persistence, health identity, and library/CLI consumer
  checks do not apply.

## Deployment identity

Every public file in fresh `dist/` matched the live custom domain byte for
byte. Key SHA-256 values:

```text
index.html                          f135a76faf2b7d284f1f243ddacb43562b33d925835ab1ec69b79d29f8ef068d
assets/index-ny27DvmC.js            1d2a3f4ae5362d220a1b490a91858edde21f096639129ee1ddf6bd0e42e8fc4f
assets/index-hwIoh9vf.css           29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
assets/renewal-board-DYLupGEF.webp  d396c4ad0439fee2d13399ed25ffa1d8538ad952651a3a26e715f9648a7b4f83
manifest.webmanifest                3d7823c36536dfb747b6f54eff4ede6efa4c2bb9d77c003dc2bc951dae8622a1
sw.js                               4039768a45558963c2af391392132199f14472ec118650faa26b825e79333109
404.html                            4617b6488e8b23f6fa2a0968e402c99ed0e026fba07255d995e39db746bddef5
```

The earlier 404-copy blocker is fixed, and this is not a stale static
deployment. Do not release until the P0 persisted-input failure and live
checkout are fixed and independently reverified.
