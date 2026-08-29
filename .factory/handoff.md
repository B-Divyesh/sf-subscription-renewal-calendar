# Polish round 1 handoff — PASS

**Base candidate:** `c94d95222c8825f0442c1e9f5ff89ea9b62ca27e`
**Repair commits:** `c664f38f06e1fce37997d01e92b1100ff9a4dcf9`, `23592b4`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Deployment:** `80507a79-aa8b-4b77-aa0b-028d2b30a982`
**Status:** PASS — all 25 findings in `.factory/review-1.md` are closed.

## Delivered

- Added real local encrypted-backup restore with passphrase decryption, validation,
  preview, merge/replace choice, error recovery, and demo namespace isolation.
- Added exact browser claim coverage for backup restore, real-workspace offline use,
  manual add, owner/review dates, and all decision edits. `.factory/claims.json`
  now lists 20 claims with one tagged test each.
- Rewrote the flagged first-screen, footer, README, and product-name copy. The
  catalog description is verb-first and within 120 characters.
- Completed per-route metadata, canonical URLs, social metadata, static 404 metadata,
  180 px Apple touch icon, mobile Calendar navigation, polite route announcements,
  external checkout cue, and consistent 404 footer version.

## Verification

Fresh clone: `/tmp/subscription-renewal-calendar-clean-4OIyjW` at
`c664f38f06e1fce37997d01e92b1100ff9a4dcf9`.

- `npm ci --include=dev` — passed, 0 vulnerabilities.
- Every exact command in `.factory/claims.json` — 20/20 passed individually.
- `npm test` — 21 passed.
- `npm run typecheck` and `npm run lint` — passed.
- `npm run build` — passed; `dist/index.html` exists. JS 34.74 kB raw / 11.74 kB
  gzip; CSS 12.20 kB raw / 3.36 kB gzip; hero 71.48 kB.
- `npm run test:e2e` — 36 passed. It covers claims, restore errors, privacy requests,
  offline reload, keyboard/dialog behavior, routes, metadata, 404, mobile, and axe.
- Live `verify-url.sh` — passed for `/` and `/demo`, with no console errors and
  correct title/lang/h1/main/alt/button checks.
- Live axe at 390 px — zero serious or critical findings on `/`, `/demo`, `/app`,
  `/privacy`, `/terms`, and a missing route.
- Live cold checks passed for `?demo=1`, one-click sample controls, restore preview
  and isolation, every real route title/canonical, mobile Calendar navigation, and
  404 version. Screenshots and reports are in `.factory/qa-artifacts/polish-1/`.

See `.factory/polish-1.md` for the finding-by-finding map and evidence paths.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

No known gaps remain.
