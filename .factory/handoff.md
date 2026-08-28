# Handoff — repair 2

## Status

Release-blocking findings from independent verification of candidate
`3c2833eb5796bd2d0a654436b5573c5802f99f4b` were repaired on 2026-08-28.
This remains a static, local-first PWA with output in `dist/`.

## Repairs

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

## Verification

Clean install and release checks passed:

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

## Run and deploy

```sh
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
```

Deploy `dist/` as the existing static artifact. The repository has no
separate deployment script; the configured static deployment is triggered by
the pushed `main` branch.

Deployed with `/opt/fleet/lib/deploy-static.sh subscription-renewal-calendar dist`.
Azure Static Web Apps deployment `6777cb23-f951-4ef7-af87-22f424435f46`
succeeded. The production custom domain returned HTTPS 200 and matched the
built `index.html` and JavaScript SHA-256 hashes after deployment.

## Known gaps

No exchange-rate conversion is performed. Currency totals deliberately remain
separate until the user has supplied an explicit conversion source.
