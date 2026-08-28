# Independent verification 2 — FAIL

**Date:** 2026-08-28
**Candidate:** `3c2833eb5796bd2d0a654436b5573c5802f99f4b`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Result:** **FAIL — do not release**

The live deployment is byte-identical to the candidate build. This is not a
deployment-only failure. The candidate fails the mandatory one-click demo
gate, can expose or overwrite real data during demo navigation, can be made
unusable by one accepted CSV row, and unlocks Pro with an invalid license.

## Mandatory first checks

### Claims

After `npm ci`, every command in `.factory/claims.json` was run exactly as
declared. All eight passed and each selected exactly one tagged test.

| Claim | Exact command | Result | Evidence |
| --- | --- | --- | --- |
| `weekly-occurrences` | `npm test -- -t @claim:weekly-occurrences` | PASS | 1 selected test; `qa-artifacts/claims/weekly-occurrences.log` |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS | 1 selected test; `qa-artifacts/claims/demo-isolated.log` |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS | 1 selected test; `qa-artifacts/claims/offline-reload.log` |
| `private-data` | `npm run test:e2e -- --grep @claim:private-data` | PASS | 1 selected test; `qa-artifacts/claims/private-data.log` |
| `ics-export` | `npm run test:e2e -- --grep @claim:ics-export` | PASS | 1 selected test; `qa-artifacts/claims/ics-export.log` |
| `sixty-day-window` | `npm test -- -t @claim:sixty-day-window` | PASS | 1 selected test; `qa-artifacts/claims/sixty-day-window.log` |
| `csv-roundtrip` | `npm run test:e2e -- --grep @claim:csv-roundtrip` | PASS | 1 selected test; `qa-artifacts/claims/csv-roundtrip.log` |
| `encrypted-backup` | `npm run test:e2e -- --grep @claim:encrypted-backup` | PASS | 1 selected test; `qa-artifacts/claims/encrypted-backup.log` |

The two unit-level claim commands do not enter through `/demo`, despite the
verification contract requiring demo-entry-point proof. More importantly,
the declared demo isolation test opens `/?demo=1` directly and misses the
broken first-screen and navigation paths described below.

### Cold first-read and one-click demo

At 390 px, a clean live visit showed:

> See renewals before they charge. For small teams that need a cost, owner,
> and decision before every recurring charge. Try it with sample data.

This copy clearly says what the product does, who it is for, and what to click.
The action is in the first viewport. However, clicking it from the cold landing
page navigated to `/demo` and showed **No subscriptions yet**: zero instances
of `Office cleaner` and no sample calendar. The one-click sample-data gate
therefore fails. Evidence: `qa-artifacts/live/demo-transitions.json` and
`qa-artifacts/live/first-click-demo-mobile.png`.

## Release-blocking defects

### P0 — Demo/real navigation breaks isolation and can overwrite real data

The SPA changes `isDemo` when navigating but does not load the new workspace.
Three fresh live reproductions establish the impact:

1. After adding `REAL SENTINEL` in `/app`, selecting **Demo** showed that real
   record under the banner “Demo — sample data, nothing is saved.” The sample
   data was absent. Real data is therefore read and displayed in demo mode.
2. With an existing real record, opening `/demo` directly loaded the six sample
   subscriptions. Selecting **Start for real** kept those sample records in
   memory and hid the demo banner instead of loading the real database.
3. Adding `NEW AFTER DEMO` then persisted the six samples plus the new record
   into the real database. After reload, `REAL DATA MUST SURVIVE` was gone.

This violates the demo sandbox, the privacy promise, and local data integrity.
Evidence: `qa-artifacts/live/demo-transitions.json`,
`qa-artifacts/live/edge-scenarios.json`, and
`qa-artifacts/live/real-overwritten-after-demo.png`.

Demo edits also remained after leaving via Home and returning to `/demo`,
contradicting the privacy-page claim that demo data “is discarded when you
leave.”

### P0 — One invalid CSV currency bricks the persisted app

The CSV parser accepts arbitrary `currency` text. Importing the otherwise
valid row below persisted it and then threw `RangeError: Invalid currency code
: NOT-A-CURRENCY` during rendering:

```csv
name,amount,currency,frequency,starts_on,owner
Bad currency,10,NOT-A-CURRENCY,monthly,2026-08-28,Rae
```

After reload, `#app` was empty and the page contained only the skip link. The
normal UI cannot delete or repair the poisoned row; clearing all site data is
the practical recovery, which also deletes valid records. Evidence:
`qa-artifacts/live/edge-scenarios.json` and
`qa-artifacts/live/invalid-currency-blank.png`.

### P1 — Invalid licenses unlock the paid forecast

Submitting `definitely-invalid-qa-token` received HTTP 200 with an invalid
verdict and displayed “This license is not active.” Nevertheless the token
remained in `sb_license:subscription-renewal-calendar`, and the paid forecast
immediately displayed `$130.00 scheduled across the next year.` The UI treats
the presence of any token as entitlement instead of requiring a cached valid
verdict. Evidence: `qa-artifacts/live/edge-scenarios.json` and
`qa-artifacts/live/invalid-license-unlocks.png`.

### P1 — Mixed-currency totals are financially false

The product permits a currency per subscription but sums raw amounts and labels
the result with the first occurrence's currency. Two monthly records—USD 10
and EUR 20—produced two occurrences each and a summary of **$60.00**, while the
rows correctly showed USD 20 and EUR 40 in aggregate. Amounts in different
currencies must be kept separate or converted with an explicit rate. Evidence:
`qa-artifacts/live/edge-scenarios.json`.

### P1 — The core decision workflow is incomplete

Existing subscriptions have only a Delete control. There is no way to change
an owner, review lead time, amount, note, or keep/review/cancel decision after
creation/import. Thus “mark it keep, review, or cancel” is not an available
workflow, and imported spend cannot be assigned or reviewed iteratively as the
brief requires. The product also has no cost-change history or chosen
high-value threshold, so it cannot show rising costs or measure the brief's
“above a chosen threshold at least seven days early” outcome.

### P1 — The claims registry does not cover material public promises

All listed tests pass, but the landing page, privacy page, and README make
material unlisted or mismatched claims, including “Your entries stay on your
device,” no analytics/trackers, demo data discarded when leaving, delete
everything, the 12-month paid view, and full RFC 4180 import. The `private-data`
claim is explicitly limited to demo data and its test only observes a direct
demo/export flow; it does not prove the broader real-entry promise. One of the
unlisted promises—discard on leaving—is demonstrably false. Under the claims
contract, unlisted claims are release-blocking.

### P2 — ICS output does not escape accepted text values

An accepted CSV record named `Vendor, Inc; Plan` exported an ICS summary with
raw comma and semicolon characters. RFC 5545 TEXT values require escaping
comma, semicolon, backslash, and newlines. CSV-imported newlines can therefore
also inject malformed property lines. Evidence:
`qa-artifacts/live/edge-scenarios.json`.

### P2 — Manual accessibility requirements fail despite clean axe results

- Keyboard focus on **Import CSV** lands on an opacity-0, 1×1 px file input,
  so the focus indication is not visible.
- The modal Close control is 36×36 px and form controls are 42 px high, below
  the required 44 px touch target.
- Chromium's accessibility tree reports the open dialog role with an empty
  accessible name; it has no `aria-label` or `aria-labelledby`.

The skip link, other focus rings, Escape behavior, focus restoration, and
route-change heading focus passed. Evidence:
`qa-artifacts/live/accessibility.json` and
`qa-artifacts/live/mobile-dialog.png`.

### P2 — Old service-worker caches are never removed

The worker versions cache names and announces an update, but its activation
handler never deletes superseded `renewal-ledger-*` caches. Repeated releases
will retain old shells/assets and consume storage. Current-version live
offline reload passed.

## Verification evidence

### Repository and production build

- HEAD exactly matched the requested candidate SHA.
- `npm ci`: PASS; `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: 2 files, 13 tests passed.
- `npm run test:e2e`: 11 Playwright tests passed.
- `npm run build`: PASS; `dist/` produced.
- Bundle: JS 23.88 KB / 8.75 KB gzip; CSS 10.27 KB / 2.95 KB gzip;
  hero WebP 71.48 KB. Static budgets pass.

### Live/candidate identity

The fresh build and live deployment were byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `9e40c2bd88450b99c08b655187c8e4a36a61fbe6b95c336ca435b451764d0f38` |
| JS | `5a137d149410c4a16ce5c5fc343d793ad66e164e271550a3b81549a77e77ae51` |
| CSS | `b3d39088561b63c5d1bcda0cd79f7b040ad68a1c6ce22b888b9d4d384ee248fa` |
| `sw.js` | `f98f0df720f26b2deaefa1a9c003924fc96e96100538cce97b8d7265c23c7ff1` |
| manifest | `3d7823c36536dfb747b6f54eff4ede6efa4c2bb9d77c003dc2bc951dae8622a1` |

Known routes returned 200 and `/missing` returned the styled HTTP 404.
Hashed assets used one-year immutable caching; `sw.js` used `no-cache`.

### Browser, accessibility, privacy, and PWA

- Live `/`, `/demo`, `/app`, `/privacy`, and `/terms`: correct route title,
  `lang=en`, one `main`, one `h1`, no missing image alt, no horizontal
  overflow, and no console/page errors.
- Axe 4.10.2 on those routes and the open modal: 0 violations, including 0
  serious/critical. Manual findings are listed above.
- Desktop and 390 px layouts were visually inspected. Reduced-motion mode
  produced `0s` occurrence transitions.
- Factory `verify-url.sh`: PASS, HTTPS 200, title/lang/main present, one `h1`,
  no missing alt, no unnamed buttons, no console errors.
- Initial supported-route traffic was same-origin only. No third-party fonts,
  scripts, analytics, or trackers loaded. Billing verification was the only
  exercised cross-origin runtime call.
- CSP, HSTS, `nosniff`, and strict-origin referrer policy were present. CSP
  does not include `frame-ancestors`, leaving clickjacking protection as a
  hardening gap.
- Direct `/demo` installed a controlling service worker and reloaded offline
  with sample data. Chromium reported no manifest errors; all shell resources
  were cached with the fingerprinted cache name.
- Normal add/persistence, amount 0 and review-days 0, native negative/required
  validation, malformed-then-valid CSV recovery, delete/Undo/reload, CSV
  round-trip, weekly/monthly/annual recurrence tests, and history focus passed.
- An exported encrypted backup contained only `version`, `salt`, `iv`, and
  ciphertext; deriving the AES-GCM key with the supplied passphrase recovered
  all six sample subscriptions.

### Performance and API policy

Three Lighthouse 12.6 mobile runs scored performance **88, 94, 95** (median
94), accessibility 100, and best practices 100. Median LCP was 1.33 s; CLS was
0. TBT ranged from 268–470 ms. Initial transfer was about 84 KiB.

The live Sociobot license verification endpoint was sent sequential rapid
invalid-token requests. Requests 1–30 returned 200; request 31 returned 429
with `Retry-After: 4` and the correct product-origin CORS header. Rate limiting
therefore passes at an observed threshold of 30 successful requests in the
active window.

Sign-in, library/CLI packaging, backend persistence/concurrency, and health
identity checks are not applicable to this static, unauthenticated PWA. The
only server endpoint used by the product is the Sociobot billing endpoint
tested above.

## Required repair before re-verification

1. Make every route/workspace transition load the selected IndexedDB namespace
   before rendering; never retain one namespace's items in another. Add tests
   for landing → Demo, real → Demo, Demo → Start for real, existing real data,
   and navigation/back/reload.
2. Validate currency against the UI-supported ISO codes before persistence and
   provide a recovery path that cannot brick rendering.
3. Gate Pro on a cached valid verification verdict; remove invalid tokens and
   test invalid, revoked, offline, return-URL, and daily-cache states.
4. Separate mixed-currency totals, escape RFC 5545 text, and add matching
   end-to-end claims.
5. Add an edit/decision workflow and the brief's rising-cost/threshold support,
   or document and justify an honest scope change.
6. Register every public claim with one appropriately scoped test; fix or
   remove false promises.
7. Make file-input focus visible, name the dialog, raise all touch targets to
   44 px, and delete superseded service-worker caches on activation.
