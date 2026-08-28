# Independent verification 4 — FAIL

**Date:** 2026-08-28  
**Candidate:** `658b53ec35487d97ba23343917b65b03c6be3ec6`  
**Live URL:** https://subscription-renewal-calendar.sociobot.in  
**Result:** **FAIL — do not release**

## Release decision

This is not a deployment-only failure.  A fresh production build from the
candidate is byte-for-byte identical to the live deployment, including
`index.html`, `sw.js`, JavaScript, CSS, and hero WebP (SHA-256 checked for all
five).  The candidate itself fails the mandatory quality/claims contract.

## Required first-read and demo gate — PASS

A cold, storage-free visit to the live root returned HTTP 200 with no console
or page errors.  The first screen says:

> See renewals before they charge. For small teams that need a cost, owner,
> and decision before every recurring charge. Try it with sample data — Loads
> a working 60-day calendar.

This plainly explains the job, audience, and first action.  The action is a
one-click link to `/demo`. It opened the required persistent banner, `Demo —
sample data, nothing is saved`, with **Reset demo** and **Start for real**.

## Claims — PASS (but inventory incomplete; see P1)

`.factory/claims.json` exists and contains ten entries. From the clean,
detached checkout of the exact candidate, `npm ci` completed and every declared
command was run separately. Each selected one passing Playwright test. A final
`npm run test:e2e -- --grep @claim:` ran all ten together: **10 passed**.

| Claim | Declared command | Result |
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

## Quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 15/15 Vitest tests |
| `npm run typecheck` | PASS | TypeScript exited 0 |
| `npm run lint` | PASS | ESLint exited 0 |
| `npm run build` | PASS | `dist/` produced |
| `npm run test:e2e` | **FAIL** | 19 passed, 1 failed |
| Claim-only Playwright run | PASS | 10/10 passed |
| Mobile Lighthouse (`/demo`) | PASS | Performance 100, accessibility 100; LCP 1,029 ms, CLS 0 |

The production build is within budget: JavaScript 28.62 kB (10.24 kB gzip),
CSS 11.26 kB (3.14 kB gzip), and hero WebP 71.48 kB.

## Defects

### P0 — Mandatory full end-to-end suite is red

`npm run test:e2e` exits 1. The final test,
`names the dialog, keeps 44px dialog controls, and shows file-input focus on
its label`, expects `.file-button` to have a non-`none` computed outline after
focusing the native CSV input, but receives `none` in the test runner.

This is release-blocking under the repository definition of done even though
the same control visibly showed a coral 4 px focus outline in a separate live
browser inspection. The test is therefore either flaky or its assertion does
not faithfully observe the intended focus treatment; it must be made reliable
and the complete suite must pass before release.

### P1 — Public claims are not all represented in `.factory/claims.json`

The claims contract requires every visitor-relevant statement to have one
listed, observable sandbox test. The landing page and README make claims that
do not have entries in the ten-item inventory, including:

- the exact paid price, **“$19 once”** / **“Pro costs $19 once”**;
- **“Runs on this device”**;
- that there are **no bank connections**; and
- README claims that cost changes are recorded, high-value charges are flagged,
  and a previously verified license remains available offline.

Some related behavior has untagged tests, but that does not meet the required
one-entry/one-`@claim:<id>` contract. Remove untestable wording or add a claim
entry and exactly one stable test for each statement.

## Product evidence that passed

- The demo rendered all 18 sample occurrences in its 60-day window, including
  nine weekly Office cleaner occurrences, six subscriptions, owners, review
  dates, decisions, and grouped USD total.
- Local end-to-end coverage passed normal addition/editing, RFC 4180 CSV
  round-trip with commas/quotes/newline, ICS export, encrypted AES-GCM backup,
  deletion, invalid date/decision/currency recovery, mixed-currency grouping,
  Pro verification behavior, dialog cancellation/Escape, and cost increase.
- Live outgoing-request capture for landing → demo recorded only same-origin
  document, CSS, JS, and image requests; no analytics/tracker request or data
  egress occurred. The live CSP permits only self plus the Sociobot billing
  API in `connect-src`; HSTS, `nosniff`, and strict referrer policy are present.
- Live PWA verification: an active controlled service worker with cache
  `renewal-ledger-7ccb6a6a81a9` allowed a successful offline reload of `/demo`.
  The local update-notification test passed. Immutable caching is applied to
  hashed assets and `sw.js` uses `no-cache`.
- At 390 px there was no horizontal overflow; all five primary controls were
  48 px tall. Keyboard focus on tested controls had a visible 4 px coral ring;
  reduced motion made occurrence transitions `0s`. Axe found zero serious or
  critical violations on the live demo, and no console/page errors occurred.
- `/`, `/demo`, `/app`, `/privacy`, `/terms`, `/404.html`, `robots.txt`,
  `sitemap.xml`, and the manifest returned 200. The repository does not contain
  the requested `verify-url.sh`; equivalent Playwright semantic/console checks
  and axe checks were run.
- The sole server-side integration, Sociobot license verification, was tested
  with a harmless invalid token. Requests 1–30 returned 200; request 31
  returned **429** with `Retry-After: 3`. Observed allowance: 30 serial
  requests per client/window.

## Deployment identity

The live HTML references `assets/index-DwS4s5Cp.js` and
`assets/index-Bz1VQ-nm.css`. SHA-256 values matched the exact candidate build:

```text
index.html                                  ebda0af570265d5c4bad965482213ae3892553c2be51463f0c34fbc94f263457
sw.js                                       69ef449f5731baae12b39e3297e49834d2dc072d13a85911cdd8abd982366262
assets/index-Bz1VQ-nm.css                   83b0d26a89f581f20c1246be6b5ecab4637273149273eacfada793ddef52ab8b
assets/index-DwS4s5Cp.js                    178daa524408526a6432491ad889ce57b604b827e93b8187d870a573b596c8ab
assets/renewal-board-DYLupGEF.webp          d396c4ad0439fee2d13399ed25ffa1d8538ad952651a3a26e715f9648a7b4f83
```

No product code was modified during this verification.
