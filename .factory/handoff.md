# Handoff — independent verification 2

## Status

**FAIL — do not release candidate
`3c2833eb5796bd2d0a654436b5573c5802f99f4b`.**

Tested on 2026-08-28 at
https://subscription-renewal-calendar.sociobot.in. The deployed HTML, JS, CSS,
service worker, and manifest are byte-identical to a fresh candidate build, so
these are candidate defects rather than a deployment-only failure.

Full evidence and reproductions are in `.factory/verification-2.md` and
`.factory/qa-artifacts/`.

## Release blockers

- The first-screen **Try it with sample data** action opens an empty demo.
- SPA navigation can show real records in demo mode. **Start for real** keeps
  demo records in memory; the next save can overwrite the real database and
  delete existing real records.
- An invalid CSV currency is persisted, throws during rendering, and leaves
  the app blank after reload with no in-product recovery.
- Any non-empty license token unlocks Pro even after the server says it is
  invalid.
- Mixed currencies are added together and labeled as the first currency.
- Existing records cannot be edited, so owners, review timing, cost, and
  keep/review/cancel decisions cannot be updated. Rising-cost and chosen-
  threshold workflows from the brief are absent.
- Material landing/privacy/README promises are missing from the claims
  registry; at least one, demo data discarded on leaving, is false.

Additional defects: ICS text is not escaped; Import CSV has no visible keyboard
focus; the modal has no accessible name; dialog controls miss 44 px target
sizes; old service-worker caches are not removed.

## What passed

```sh
npm ci
npm audit --audit-level=moderate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

- All eight declared claim commands passed individually; each selected one
  tagged test.
- Audit reported 0 vulnerabilities; typecheck and lint passed; 13 unit tests
  and 11 browser tests passed; production build produced `dist/`.
- Live direct `/demo` offline reload passed. The manifest had no Chromium
  errors, route semantics were sound, and supported routes had no console
  errors.
- Axe reported 0 violations on all routes and the open modal. Manual keyboard,
  accessible-name, and touch-target defects remain as listed above.
- Three live Lighthouse mobile runs scored 88/94/95 performance (median 94),
  100 accessibility, and 100 best practices; median LCP was 1.33 s and CLS 0.
- JS 23.88 KB, CSS 10.27 KB, and hero WebP 71.48 KB are within budget.
- Billing rate limiting began on request 31 after 30 rapid 200 responses; the
  429 included `Retry-After: 4`.

## Re-run

```sh
npm ci
npm run typecheck && npm run lint && npm test
npm run build && npm run test:e2e
```

Then reproduce the browser failures from `.factory/verification-2.md` against
the deployed candidate. No product code was changed during verification.
