# Handoff — release-blocking QA repair 3

## Latest independent verification — candidate `5cb2153e77e97a3b07a880eeae13eb18845e9276`

**Status: FAIL.** Independent verification on 2026-08-29 found the deployed
artifact functionally healthy and byte-identical to this candidate, with all 15
claim tests, all repository gates, live PWA/privacy/accessibility checks, and
rate-limit checks passing. The candidate still fails the mandatory plain-words
contract: the 404 h1 reads **“This page is not on the board.”**, a metaphorical
heading. Change it to literal copy such as **“Page not found”** and reverify.
See [verification-5.md](verification-5.md) for exact commands, evidence,
severity, bundle/Lighthouse results, live URL, and the observed license API
allowance (30 requests, then HTTP 429 with `Retry-After: 3`).

## Status: repaired, verified, pushed, and deployed

The release blockers in independent verifier report commit
`7eaaf21d56582eb03ec9e82e44155b94d478f794` for candidate
`658b53ec35487d97ba23343917b65b03c6be3ec6` are repaired. The product remains
the same static, local-first PWA and the researched brief and visual system are
unchanged.

Repair commit `bf4a7b0fa2de5a241f0b208dea518f59c33ce54e` was pushed to `main` and
deployed to https://subscription-renewal-calendar.sociobot.in with:

```sh
/opt/fleet/lib/deploy-static.sh subscription-renewal-calendar dist
```

Azure Static Web Apps deployment `2ace65b9-4a2f-4c10-b66f-d7cf9fce4fe0`
succeeded in the existing `centralus` app.

## What was repaired

### Reliable visible focus for Import CSV

The transparent native file input now covers the full 44 px branded control.
Its label receives the designed 4 px coral ring whenever the input has focus.
The browser regression follows the real keyboard path from **Add subscription**
with Tab, waits on computed CSS, and checks the active element, ring width,
ring colour, and 44 px input target. This replaces the verifier's immediate,
timing-sensitive `getComputedStyle` read.

### Complete public claims inventory

`.factory/claims.json` now contains 15 claims. New one-test-per-claim browser
proofs cover:

- on-device IndexedDB persistence across reload;
- the $19 one-time Pro price, Sociobot checkout target, and usable free core;
- recorded cost changes that survive reload;
- the chosen high-value threshold warning;
- a previously verified Pro forecast after an offline reload;
- the absence of bank controls and cross-origin subscription-data requests.

A unit policy test now fails if a claim is missing a browser tag, duplicated,
or declares a command other than its exact `@claim:<id>` filter.

The existing weekly and 60-day claim proofs were also made date-relative. They
now derive the expected recurrence schedule and exact 60-day span instead of
assuming the verifier's August 28 count forever. This fixed the UTC-boundary
failure reproduced on August 29. The installed-update check now waits for the
asynchronous workspace render before injecting its test event.

## Verification evidence

### Clean repository gates

```text
npm ci                              PASS — 136 packages, 0 vulnerabilities
npm audit --audit-level=moderate    PASS — 0 vulnerabilities
npm run typecheck                   PASS
npm run lint                        PASS
npm test                            PASS — 2 files, 16 tests
npm run test:e2e                    PASS — 24 browser tests
npm run build                       PASS — dist/ produced
```

Every command in `.factory/claims.json` was run separately. All 15 commands
selected exactly one tagged Playwright test and passed. The complete claim run
and full suite used the pinned Playwright 1.58.2 Chromium.

Production bundle sizes remain inside the PWA budgets:

```text
JavaScript   28.62 kB / 10.24 kB gzip
CSS          11.45 kB /  3.18 kB gzip
Hero WebP    71.48 kB
```

### Browser, keyboard, accessibility, and privacy

- The factory `verify-url.sh` passed locally and on live `/demo`. Live load was
  740 ms, with the correct title and `lang=en`, one H1, one main landmark, no
  missing image alt text, no unnamed buttons, and no console errors.
- The full Playwright axe scan covered `/`, `/demo`, `/app`, `/privacy`,
  `/terms`, `/404.html`, and the open dialog: zero serious or critical issues.
- Desktop and 390×844 screenshots were inspected. The live 390 px flow had no
  horizontal overflow. All primary and dialog targets were at least 44 px.
- Live keyboard evidence: `csv-input` became the active element through Tab;
  its visible label ring computed to `rgb(232, 91, 69) solid 4px`; the native
  target measured 350×44 px.
- The open dialog resolved the accessible name **Add a subscription**, Escape
  closed it, and focus restoration passed.
- Reduced-motion coverage reported `0s` occurrence transitions.
- A live root → demo flow requested only
  `https://subscription-renewal-calendar.sociobot.in`; no analytics, tracker,
  bank, font CDN, or other data origin appeared.

Lighthouse 12.6 mobile on the local production artifact:

```text
Performance       100
Accessibility     100
Best practices    100
LCP             1.10 s
CLS                0
TBT              3 ms
```

### PWA, policy, billing, and deployment identity

- The live service worker controlled `/demo`; offline reload restored the full
  sample calendar. Update notification and old-cache cleanup tests passed.
- Hashed assets return `public, max-age=31536000, immutable`; `sw.js` returns
  `no-cache`. Unknown routes return HTTP 404.
- Live responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  and `strict-origin-when-cross-origin`.
- One harmless invalid live license request returned HTTP 200 with
  `{valid:false, reason:"invalid"}`, product-origin CORS, and `no-store`.
  The next 40 sequential policy probes returned 29×200 then 11×429; the
  throttled response included `Retry-After: 2`.
- Sign-in, backend health/concurrency, and package/consumer checks do not apply
  to this unauthenticated static PWA.

Fresh live downloads were byte-identical to `dist/`:

```text
index.html                                  faab4bd78f9f04fc3b885b134ae9b7a1d0a0a4f212419e5ab5ecebaf95b7c86d
sw.js                                       10d419dbd9d4f17882c88dbedda6f14b71c8c265e116f76da2b7669af242923c
manifest.webmanifest                        3d7823c36536dfb747b6f54eff4ede6efa4c2bb9d77c003dc2bc951dae8622a1
assets/index-D1XkFH9P.js                    178daa524408526a6432491ad889ce57b604b827e93b8187d870a573b596c8ab
assets/index-hwIoh9vf.css                   29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
assets/renewal-board-DYLupGEF.webp          d396c4ad0439fee2d13399ed25ffa1d8538ad952651a3a26e715f9648a7b4f83
```

## Run and verify

```sh
npm ci
npm audit --audit-level=moderate
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Run each `test` command in `.factory/claims.json` separately to repeat the
claim contract. Serve `dist/` over HTTP to repeat service-worker checks.

## Known gap

No exchange-rate conversion is performed. Currency totals deliberately remain
separate until the user supplies an explicit conversion source.
