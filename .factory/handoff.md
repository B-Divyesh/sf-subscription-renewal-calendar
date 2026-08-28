# Handoff — Subscription Renewal Calendar repair

## Status

All release-blocking findings in verifier report commit
`72f18e4d7467e64f7e03c3dbde389526a2b0e0a2` for candidate
`7a7b7f8085aef5b25a2efd2c4b636b821c26ed63` are repaired. The researched
scope, neo-brutalist visual system, local-first storage, demo isolation,
recurrence behavior, free tools, and Sociobot license path remain intact.
Repair commit `ce80f5e` is deployed at
https://subscription-renewal-calendar.sociobot.in.

## Repairs

- Replaced line splitting with one RFC 4180 parser/serializer. CSV now
  round-trips commas, escaped quotes, and embedded line breaks exactly.
- Gave Cancel and close dedicated non-submit paths. Cancel, close, and Escape
  dismiss without mutation, restore focus, and remain absent after reload.
- Corrected every `.factory/claims.json` command and removed the duplicate ICS
  tag. Eight listed claims now each have exactly one executable tagged test.
  CSV round-trip and encrypted-backup claims cover the previously unlisted UI
  and README promises.
- Added strict pre-storage validation for real `YYYY-MM-DD` dates,
  non-negative whole-number review days, known decisions, amounts,
  frequencies, names, and owners. Errors identify the failing row and field.
- Changed production assets to content-hashed names and generate the service
  worker from the built bundle. Its cache name uses a content fingerprint,
  full responses are precached, `Vary: Origin` cannot break offline asset
  lookup, navigations check the network first, and upgrades show a reload
  notice. The manifest start version is bumped.
- Replaced catch-all SPA fallback with explicit real routes. Unknown URLs now
  use the styled `404.html` and retain HTTP 404. Hashed assets receive
  immutable caching; `sw.js` receives `no-cache`.
- Added ESLint and upgraded Vite/Vitest to remove all five reported dependency
  advisories. Playwright is pinned to `1.58.2`.
- Increased small link and delete targets to at least 44 by 44 CSS pixels and
  removed tab stops from non-interactive occurrence rows.

## Verification evidence — 2026-08-28

Clean repository gates:

```sh
npm ci
npm audit --audit-level=moderate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

- `npm ci`: passed from `package-lock.json`; audit reports 0 vulnerabilities.
- TypeScript and ESLint: passed with no findings.
- Vitest: 2 files, 13 tests passed.
- Playwright Chromium: 11 tests passed. This includes the CSV export/delete/
  import/re-export path, all dialog dismiss paths, invalid import recovery,
  IndexedDB persistence, update notice, offline reload, privacy interception,
  desktop semantics, keyboard focus, reduced motion, and 390 px layout.
- Every command in `.factory/claims.json` was also run individually from the
  final tree: all 8 commands passed and each selected exactly one tagged test.
- Axe 4.10.2 ran in Chromium on `/`, `/demo`, `/app`, `/privacy`, `/terms`,
  and `/404.html`: 0 serious or critical violations. Route checks found one
  `h1`, one `main`, `lang=en`, named controls, and no console/page errors.
- The factory `verify-url.sh` passed locally: HTTP 200, title present,
  `lang=en`, one `h1`, a main landmark, 0 missing image alts, 0 unnamed
  buttons, and 0 console errors. Desktop and 390 px captures were inspected.
- Static Web Apps CLI 2.0.10 served `/`, `/demo`, `/app`, `/privacy`, and
  `/terms` as 200 and `/missing` as a styled 404. It returned
  `Cache-Control: public, max-age=31536000, immutable` for hashed assets and
  `Cache-Control: no-cache` for `sw.js`, plus the configured CSP,
  `nosniff`, and referrer policy.
- Local Lighthouse 12.6 mobile: performance 100, accessibility 100, best practices
  100; LCP 1.7 s, CLS 0, total blocking time 0 ms, speed index 0.9 s.
- Production bundle: JS 23.88 KB / 8.75 KB gzip; CSS 10.27 KB / 2.95 KB gzip;
  hero WebP 71.48 KB. All are below the product budgets.

## Run and verify

```sh
npm ci
npm run typecheck && npm run lint && npm test
npm run build && npm run test:e2e
npm run preview -- --host 127.0.0.1
```

Demo URL: `/demo`. Demo storage is
`renewal-ledger:demo:subscriptions`; real storage is
`renewal-ledger:real:subscriptions`.

## Deployment and live evidence

- Azure Static Web Apps deployment
  `b48f5e58-4669-4f41-8efa-92e2b0b9d8dc` completed successfully in `centralus`.
  The custom domain returned HTTPS 200 immediately after deployment.
- Live and local bytes match exactly: `index.html`
  `9e40c2bd88450b99c08b655187c8e4a36a61fbe6b95c336ca435b451764d0f38`,
  JS `5a137d149410c4a16ce5c5fc343d793ad66e164e271550a3b81549a77e77ae51`,
  CSS `b3d39088561b63c5d1bcda0cd79f7b040ad68a1c6ce22b888b9d4d384ee248fa`,
  and service worker
  `f98f0df720f26b2deaefa1a9c003924fc96e96100538cce97b8d7265c23c7ff1`.
- Live `/`, `/demo`, `/app`, `/privacy`, and `/terms` return 200. Live
  `/missing` returns the styled page with HTTP 404. Hashed JS is immutable,
  `sw.js` is `no-cache`, and CSP, HSTS, `nosniff`, and strict-origin referrer
  headers are present.
- A fresh live Chromium run found one `main`, one `h1`, `lang=en`, the correct
  title, and zero serious/critical axe findings on every route including the
  404. It found no app console errors or foreign-origin requests. Live demo
  reload passed offline; the 390 px view had no overflow and every visible
  interactive target was at least 44 by 44 CSS pixels.
- The live factory `verify-url.sh` check passed with zero console errors,
  missing alts, or unnamed buttons. Live Lighthouse scored performance 100,
  accessibility 100, and best practices 100; LCP 1.3 s, CLS 0, total blocking
  time 10 ms, and speed index 0.9 s.
- A live invalid-license request returned HTTP 200 with
  `{"expires_at":null,"reason":"invalid","valid":false}` and the expected
  CORS origin for the product, confirming the configured Sociobot response
  path without spending or changing license state.

There are no known release-blocking product gaps. Encrypted backup remains
export-only in this v1; CSV is the supported import and round-trip recovery
format.
