# Independent verification — FAIL

**Date:** 2026-08-28  
**Candidate:** `7a7b7f8085aef5b25a2efd2c4b636b821c26ed63`  
**Live URL:** https://subscription-renewal-calendar.sociobot.in  
**Result:** **FAIL — do not release**

The live JavaScript, CSS, and service worker were byte-identical to a fresh
production build of the candidate (`app.js` SHA-256
`45fd82f63a063a6ed98daa268d24dfba58bcd1bcc0574473d8264b801476ce7c`,
`index.css` `c5cc6de5c707735cec4cc0cbb7d0d2c8528bcb1eec3f466bfc722d7e1ff58c59`,
`sw.js` `d79490bd2cab9561551e9a58654f8256707f596b673635797c698d6908d065d3`).
This is a candidate defect, not a deployment-only failure.

## Required first-read and claims checks

Cold, storage-free desktop visit returned HTTP 200 and showed:

> See renewals before they charge. For small teams that need a cost, owner,
> and decision before every recurring charge. Try it with sample data — Loads
> a working 60-day calendar.

It answers what the product does, who it is for, and what to click first in
plain words. The one-click sample action led to `/demo` and showed the required
demo banner. This gate passed.

`npm ci` completed. Every command in `.factory/claims.json` was then run
exactly as declared, before the rest of repository QA:

| Claim | Exact declared command | Result | Evidence |
| --- | --- | --- | --- |
| `weekly-occurrences` | `npm test -- --grep @claim:weekly-occurrences` | **FAIL** | Vitest 2.1.9 exits 1: `CACError: Unknown option --grep`. |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS | 1 Playwright test passed. |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS | 1 Playwright test passed. |
| `private-data` | `npm run test:e2e -- --grep @claim:private-data` | PASS | 1 Playwright test passed. |
| `ics-export` | `npm test -- --grep @claim:ics-export` | **FAIL** | Same unsupported `--grep` error, exit 1. |
| `sixty-day-window` | `npm test -- --grep @claim:sixty-day-window` | **FAIL** | Same unsupported `--grep` error, exit 1. |

Any failed declared claim command is release-blocking. Additionally,
`@claim:ics-export` occurs in both `tests/domain.test.ts` and
`tests/product.e2e.ts`; the claims contract requires exactly one tagged test
per claim. The product also claims CSV import/export and encrypted backup in
the README and UI without corresponding entries in `.factory/claims.json`.

## Defects

### P0 — CSV-first core workflow cannot round-trip its own export

The researched smallest useful product is explicitly **offline CSV-first**.
On the live site I added a normal subscription, exported CSV, opened a clean
real workspace, and imported that downloaded file. The downloaded row was:

```csv
"QA monthly tool","42.5","USD","monthly","2026-08-28","Rae","7","review",""
```

Import displayed `Row 2 has an invalid amount, frequency, or starts_on date.`
and created no record. `parseCsv` splits lines on commas and never unquotes
fields, while `exportCsv` quotes every field. This breaks recovery, migration,
and the advertised CSV import/export path.

### P1 — Add-dialog Cancel saves data instead of cancelling

In a fresh real workspace, I opened **Add subscription**, completed valid
fields, and clicked **Cancel**. The dialog closed and the app announced
`Cancel should not save is now on the calendar.` The subscription appeared in
the list. Both dialog buttons submit through the save handler; the intended
cancel action is destructive in effect and invalidates recovery expectations.

### P1 — Claims contract is not executable

Three of six required claim commands fail because current Vitest accepts
`--testNamePattern`/`-t`, not `--grep`. This alone is an explicit release
blocker even though `npm test` without filtering passes.

### P2 — Invalid dates are silently accepted by CSV import

Uploading `2026-02-30` as `starts_on` displayed `Imported 1 subscription.`
instead of an actionable error. The date-only JavaScript parsing normalizes
this impossible value rather than rejecting it, so the displayed recurrence is
not the entered schedule.

### P2 — PWA update/caching contract is incomplete

The service worker was active and a live offline reload of `/demo` passed, but
there is no client-side update detection or “update available” toast. It uses
the fixed cache name `renewal-ledger-v2` and stable, unhashed asset URLs. A
future app-only deployment can therefore leave a client on stale cached assets.
Live static assets also use `Cache-Control: public, must-revalidate, max-age=30`
rather than immutable versioned-asset caching.

### P2 — Unknown routes return HTTP 200

`/missing` renders the styled SPA message but responds HTTP 200. The deployed
`staticwebapp.config.json` rewrites 404 responses to `/index.html`, not the
provided `/404.html`, so it is not a real 404 response.

## Verification completed

- Fresh install: `npm ci` passed (npm reported 5 dependency audit
  vulnerabilities: 3 moderate, 1 high, 1 critical).
- Full tests: `npm test` passed (5 unit tests); `npm run test:e2e` passed
  (4 Playwright tests). There is no lint script. `npm run build` passed and
  includes `tsc -b`; `dist/` was produced.
- Bundle budget: JS 21.96 KB / 8.12 KB gzip; CSS 9.82 KB / 2.85 KB gzip; hero
  WebP 71.48 KB. These are within the stated static-PWA budgets.
- Live semantic/console checks across `/`, `/demo`, `/app`, `/privacy`,
  `/terms`, and the unknown-route screen: each had `lang=en`, one `<main>`,
  one `<h1>`, a route-specific title, and no console/page errors. The landing
  image has descriptive alt text.
- Axe-core 4.10.3 browser scans of `/`, `/demo`, `/app`, `/privacy`, and
  `/terms` reported zero violations for WCAG 2 A/AA and best-practice rules
  (including zero serious/critical findings). The supplied `@axe-core/cli`
  launcher could not start Chrome in this container; the same axe engine was
  injected through the installed Playwright browser instead.
- Keyboard/motion/mobile: at 390 px there was no horizontal overflow; the
  skip link was first in the tab order and focus was visible; Escape closed the
  modal and restored focus; reduced-motion context had no occurrence
  transition. The inspected mobile decision list stacked controls and rows
  legibly.
- End-to-end checks: normal add and IndexedDB persistence passed; demo mode
  loaded sample data; encrypted backup generated only `version`, `salt`, `iv`,
  and encrypted `data` (no sample name in plaintext); delete confirmation and
  Undo passed; ICS export was covered by the passing Playwright test. Offline
  live `/demo` reload after service-worker activation passed with sample data
  visible.
- Privacy/network: the passing `private-data` demo claim observed only
  same-origin requests during demo/export. No third-party scripts/fonts load.
  CSP, HSTS, `X-Content-Type-Options: nosniff`, and strict-origin referrer
  policy were present on live responses.
- Billing rate limit: 30 serial invalid-license verification requests returned
  200. A following rapid 100-request concurrent burst returned 2 × 200 then
  98 × 429, with `Retry-After` values of 0 or 4 seconds. Thus throttling was
  observed after at least 32 requests in the active window; the exact configured
  threshold cannot be distinguished from the preceding serial requests.

## Required repair before a new candidate

1. Use one RFC 4180-compatible parser/serializer and add an end-to-end claim
   that exports then imports a record containing commas and quotes.
2. Make Cancel and the close control dismiss without saving; add keyboard and
   recovery coverage.
3. Correct every commands in `claims.json`, keep one tag per claim, and add
   tests for all user-facing CSV/encryption claims.
4. Reject impossible dates and invalid review values before persistence.
5. Version service-worker caches/assets and provide the required update notice;
   return a true styled HTTP 404.
