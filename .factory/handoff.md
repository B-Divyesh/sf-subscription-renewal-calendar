# Handoff — release-blocking QA repair 4

## Status

**Repaired, verified, pushed, and deployed.** The release blocker in verifier
report commit `6fe06fb20a3dea5a789dc8927a5ceb48be1a4fcb` for candidate
`5cb2153e77e97a3b07a880eeae13eb18845e9276` is resolved. The product remains
the same static, local-first PWA. The researched brief, visual thesis, public
claims, storage behavior, paid tier, and deployment class are unchanged.

Repair commits were pushed to `origin/main`:

- `c5ee05e9b1caac5adda9465fd7cf36fa5ba4e184` — repair and lock the static 404 copy.
- `e185e66c01d42de5f6594a67ee0b633133ed6037` — repair and lock the SPA fallback copy.

The final `dist/` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh subscription-renewal-calendar dist
```

Azure Static Web Apps deployment `a2c9635a-ed67-4166-8bcf-72decc050030`
succeeded in the existing Central US app. The live product is
https://subscription-renewal-calendar.sociobot.in.

## What was repaired

The verifier found the metaphorical 404 h1 “This page is not on the board.”
The static `public/404.html` and the SPA's internal not-found renderer both now
use the literal h1 **“Page not found”**. The existing title, explanation, and
**Go to the renewal calendar** recovery link remain intact.

Exact regression coverage now proves both rendering paths:

- `tests/release.test.ts` rejects the old sentence, requires the literal h1 in
  both sources, and requires the recovery link.
- `tests/product.e2e.ts` checks the title, exact h1, and recovery link on both
  `/404.html` and an unknown SPA route.
- `.factory/copy-audit.md` records the repaired 404 copy and word counts.

## Final verification evidence

Evidence is stored in `.factory/qa-artifacts/repair-4/`.

### Clean repository and claim gates

```text
npm ci --include=dev                 PASS — 136 packages, 0 vulnerabilities
npm audit --audit-level=moderate     PASS — 0 vulnerabilities
npm run typecheck                    PASS
npm run lint                         PASS
npm test                             PASS — 2 files, 17 tests
npm run build                        PASS — dist/ produced
npm run test:e2e                     PASS — 25 browser tests
15 claims.json commands separately  PASS — one selected test per claim
```

The final production sizes remain inside the PWA budgets:

```text
JavaScript   28.61 kB / 10.22 kB gzip
CSS          11.45 kB /  3.18 kB gzip
Hero WebP    71.48 kB
```

Package/consumer, sign-in, backend persistence, and backend concurrency checks
do not apply to this unauthenticated static PWA.

### Browser, accessibility, privacy, and PWA

- Factory `verify-url.sh` passed locally and live on `/demo`. The final live
  load took 700 ms with the correct title and `lang=en`, one h1, one main,
  no missing image alt text, no unnamed buttons, and no console errors.
- Playwright covered desktop and 390×844 mobile. The live mobile layout has no
  horizontal overflow and every visible link, button, and file control is at
  least 44×44 CSS px. Final desktop and mobile screenshots are in
  `repair-4/live-verify/`.
- Keyboard Tab reaches the native CSV input with its designed visible focus.
  Escape closes the named add dialog and restores focus to **Add subscription**.
- The full local route/dialog axe sweep and a separate live demo sweep found
  zero serious or critical violations. Reduced-motion coverage passed.
- A fresh live browser stored a subscription in IndexedDB across reload. Its
  request log contained only
  `https://subscription-renewal-calendar.sociobot.in`; no analytics, tracker,
  bank, font CDN, or cross-origin subscription-data request appeared.
- The final live service worker controlled the demo, restored the complete
  sample calendar offline, and displayed the installed-update notice and
  **Reload now** action.
- A direct unknown URL returns HTTP 404 with title
  `Page not found — Subscription Renewal Calendar`, h1 `Page not found`, and
  the calendar recovery link. The client-side fallback renders the same h1.
  Normal app routes had no console errors; Chromium reports the deliberately
  requested 404 document itself as a failed resource, as expected.

Local mobile Lighthouse 12.6.0 on the final production artifact:

```text
Performance       100
Accessibility     100
Best practices    100
LCP             1.1 s
CLS                 0
TBT              10 ms
```

### Response policy and deployed identity

- Root responses include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- Hashed assets return `public, max-age=31536000, immutable`; `sw.js` returns
  `no-cache`; unknown routes return HTTP 404.
- Every public file in the final `dist/` was downloaded from the custom domain
  and matched byte for byte. `staticwebapp.config.json` correctly remains
  deployment metadata and is not publicly served.

Key final SHA-256 identities:

```text
404.html                                  4617b6488e8b23f6fa2a0968e402c99ed0e026fba07255d995e39db746bddef5
index.html                                f135a76faf2b7d284f1f243ddacb43562b33d925835ab1ec69b79d29f8ef068d
assets/index-ny27DvmC.js                  1d2a3f4ae5362d220a1b490a91858edde21f096639129ee1ddf6bd0e42e8fc4f
assets/index-hwIoh9vf.css                 29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
assets/renewal-board-DYLupGEF.webp        d396c4ad0439fee2d13399ed25ffa1d8538ad952651a3a26e715f9648a7b4f83
manifest.webmanifest                      3d7823c36536dfb747b6f54eff4ede6efa4c2bb9d77c003dc2bc951dae8622a1
sw.js                                     4039768a45558963c2af391392132199f14472ec118650faa26b825e79333109
```

## Run and verify

```sh
npm ci --include=dev
npm audit --audit-level=moderate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Run each `test` command in `.factory/claims.json` separately to repeat the
public claim contract. Serve `dist/` over HTTP for service-worker checks.

## Known gap

No exchange-rate conversion is performed. Currency totals deliberately remain
separate until the user supplies an explicit conversion source. This is an
existing documented product boundary, not a repair regression.
