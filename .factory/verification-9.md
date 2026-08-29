# Independent verification 9 — PASS

**Candidate:** `9d05cd5c2374b1ebf145ea408f8bcc85a17b47ac`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Verified:** 2026-08-29 UTC
**Result:** **PASS — candidate accepted**

The deployed static application is this candidate, not a deployment-only
variant. Fresh production output and the live response had identical SHA-256
bytes for `index.html`, the hashed JS, CSS, and WebP asset, `sw.js`, and
`manifest.webmanifest`.

## Required first checks

### Cold first read — PASS

A new browser context opened the live root page cold. Its first screen says
**“See renewals before they charge.”** It says it is **“For small teams that
need a cost, owner, and decision before every recurring charge.”** The primary
action is **“Try it with sample data”**, with **“Loads a working 60-day
calendar.”** beside it. This states the job, audience, and first action in
plain words.

One click opened `/demo`, which showed the persistent **“Demo — sample data,
nothing is saved”** banner with **Reset demo** and **Start for real**, six
realistic sample subscriptions, and 17 renewal occurrences.

### Claims registry — PASS (20/20)

`.factory/claims.json` exists. After a clean `npm ci`, every declared command
was run separately, exactly as written, against its demo/browser entry point.
Every command selected and passed its one tagged browser assertion.

| Claim IDs whose exact `npm run test:e2e -- --grep @claim:<id>` command passed |
| --- |
| `weekly-occurrences`, `demo-isolated`, `offline-reload`, `offline-app-reload`, `private-data` |
| `ics-export`, `sixty-day-window`, `csv-roundtrip`, `encrypted-backup`, `backup-restore` |
| `manual-add`, `owner-review-date`, `decision-edit`, `pro-forecast`, `delete-all` |
| `device-storage`, `pro-price`, `cost-history`, `high-value-warning`, `verified-license-offline` |

The registry consistency unit test also passed, confirming exactly one browser
tag per declared claim. An initial non-declared consolidated `--grep @claim`
run encountered local Vite `ERR_CONNECTION_REFUSED` errors after its server
disappeared; it was not a failure of any listed command. All exact claim
commands passed afterward, and a fresh full browser run passed 36/36.

## Clean-checkout quality gates

```text
npm ci                 PASS — 136 packages installed; 0 vulnerabilities
npm test               PASS — 21 tests in 2 files
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS — dist/ produced
npm run test:e2e       PASS — 36 Playwright tests
```

Production output is within the static-PWA budget: JS 34.74 kB raw / **11.74
kB gzip**, CSS 12.20 kB raw / **3.36 kB gzip**, and hero WebP 71.48 kB.

## Product exercise and PWA

- The passing browser suite exercises normal manual add, every frequency,
  owner/review dates, decisions, CSV round-trip with quotes/newlines, ICS,
  encrypted backup and restore/recovery, deletion, cost history, and the
  high-value review rule. It also covers invalid date/decision input without
  persistence and dialog cancellation/keyboard escape.
- Independent local accessibility audit with Playwright Axe found **zero
  serious or critical** violations on `/`, `/demo`, `/app`, `/privacy`,
  `/terms`, and an unknown route. At 390×844 there was no horizontal overflow
  and no interactive target smaller than 44px. The first Tab focuses the
  visible 44px skip link with a 4px coral focus outline. With reduced motion,
  the hero reports `transition-duration: 0s` and `animation-duration: 0s`.
- The full suite checks offline demo and real-workspace reloads only after a
  service-worker controller exists. It also tests the update message and its
  **“An app update is ready / Reload now”** action. The shipped worker uses a
  versioned precache, `skipWaiting`, `clients.claim`, and an update message.
- A fresh live add-and-export flow made no cross-origin request and generated
  no console or page error. The cold landing page requested only same-origin
  HTML, JS, CSS, and hero image. No bank connection control exists. The only
  allowed external path is the explicit Sociobot purchase/verification flow.

## Deployment, privacy, headers, and billing

Live `/`, `/demo`, `/app`, `/privacy`, and `/terms` returned 200. An unknown
route returned a styled 404. Each application page has the appropriate title,
`lang=en`, one `h1`, and `main`; there were no console or page errors in the
live cold run. The repository has no `verify-url.sh`, so its title/lang/main/
alt/console checks were covered directly in Playwright. Playwright Axe was
used instead of the unavailable standalone CLI.

The root response sends CSP including `frame-ancestors 'none'`, HSTS,
`X-Content-Type-Options: nosniff`, and strict-origin referrer policy. Hashed
assets are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.

The optional $19 checkout returned HTTP 303 to hosted Dodo without placing an
order. The static PWA has no sign-in, product backend, library, or CLI.
For the Sociobot product-verification endpoint, 30 sequential invalid-token
requests returned 200; request 31 and later returned **429** with
**`Retry-After: 4`**. Observed allowance: **30 requests per client/window**.

## Defects by severity

No confirmed P0, P1, P2, or P3 product defects.
