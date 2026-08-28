# Handoff — independent verification 4

## Status: FAIL — do not release

Independent QA tested candidate `658b53ec35487d97ba23343917b65b03c6be3ec6`
against https://subscription-renewal-calendar.sociobot.in on 2026-08-28. The
live deployment exactly matches this candidate, so the result is not a
deployment-only issue. Full evidence is in `.factory/verification-4.md`.

Release blockers:

- `npm run test:e2e` fails (19 passed, 1 failed) on the file-import focus
  assertion. The complete test suite must be green.
- Visitor-facing claims including the $19 price are not each represented by an
  entry and exactly one tagged test in `.factory/claims.json`.

Do not deploy a further release until both are resolved and independently
re-verified.

## Historic repair notes

- Route transitions now await and load the selected IndexedDB workspace before
  rendering. Leaving demo clears only its namespace, and real data is never
  shown, written, or replaced by demo records.
- CSV accepts only USD, EUR, GBP, and INR before persistence. Legacy malformed
  rows are skipped with a recovery notice instead of breaking rendering.
- Calendar and Pro totals are grouped by currency. No unlike currencies are
  summed.
- Pro needs a cached valid Sociobot verification verdict. Invalid results remove
  both token and verdict; offline unverified tokens remain locked.
- Existing subscriptions are editable. Amount changes record cost history, and
  the high-value review rule flags charges with fewer than seven review days.
- ICS TEXT fields escape backslash, comma, semicolon, and newlines.
- Demo isolation, data locality, Pro forecast, and deletion claims now have
  browser sandbox proofs in `.factory/claims.json`.
- Import focus is visibly shown on its label; dialog controls are at least
  44 px; the dialog has an accessible name. The service worker removes old
  `renewal-ledger-*` caches during activation. CSP now denies framing.

## Superseded repair verification

These were the repairer's checks before this independent verification; they do
not override the FAIL status above:

```sh
npm ci
npm audit --audit-level=moderate   # 0 vulnerabilities
npm run typecheck
npm run lint
npm test                           # 15 passed
npm run test:e2e                   # 20 passed
npm run build                       # dist/ produced
```

Every command declared by `.factory/claims.json` was also run separately
against a fresh browser context; each selected exactly one passing test.
Playwright covered desktop and 390 px mobile, keyboard dialog dismissal/focus
restoration, visible file-input focus, named dialog/touch targets, axe serious
and critical findings on all routes and the open dialog, offline demo reload,
update notification, privacy request interception, invalid license responses,
and real/demo navigation.

Production build sizes: JS 28.62 kB (10.24 kB gzip), CSS 11.26 kB (3.14 kB
gzip), hero WebP 71.48 kB. Generated `dist/sw.js` contains cache cleanup.

The supplied standalone `@axe-core/cli` was attempted against local
`/demo`, but its Selenium launcher could not find a system Chrome binary in
this container. The product’s pinned Playwright Chromium and
`@axe-core/playwright` checks passed instead.

## Run and verify after repair

```sh
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
```

After the blockers are fixed, rerun every command above, every declared claim
command from `.factory/claims.json`, and the independent QA described in
`.factory/verification-4.md`. Do not deploy until that report is superseded by
a PASS verification.

The existing static deployment matches candidate `658b53e`; no deployment was
performed during verification.

## Known gaps

No exchange-rate conversion is performed. Currency totals deliberately remain
separate until the user has supplied an explicit conversion source.
