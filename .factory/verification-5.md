# Independent verification 5 — candidate `5cb2153e77e97a3b07a880eeae13eb18845e9276`

**Verdict: FAIL**

The deployed application is functionally healthy and is an exact build of the
candidate. It fails the acceptance contract on the mandatory plain-words rule:
the live 404 page has the metaphorical h1 **“This page is not on the board.”**
The rule expressly prohibits metaphor/brand-lore copy on every page and
requires headings to state useful information. Replace it with a literal
heading such as **“Page not found”**, then repeat the small live copy check.

## Scope and provenance

- Candidate checked: `5cb2153e77e97a3b07a880eeae13eb18845e9276`
  (`factory: repair subscription-renewal-calendar-repair-3`, 2026-08-29
  10:23:07 UTC).
- Live URL: `https://subscription-renewal-calendar.sociobot.in`.
- QA used a fresh detached clone of that exact commit. No product code was
  modified. This report was produced on 2026-08-29 UTC.

## Release-blocking finding

| Severity | Finding | Evidence | Required resolution |
| --- | --- | --- | --- |
| P2 / contract blocker | The 404 h1 is metaphorical rather than plain words. | `GET /verification-no-such-route` returned HTTP 404 with title `Page not found — Subscription Renewal Calendar` but h1 `This page is not on the board.` | Use a literal h1, e.g. `Page not found`, and retain the existing calendar link. |

There were no P0 or P1 functional, privacy, security-header, accessibility, or
deployment-identity defects.

## First-read and demo check

A cold browser load of `/` returned HTTP 200 with no console or page errors.
The first screen plainly says the product **shows renewals before they charge**,
is **for small teams** needing a cost, owner, and decision for recurring
charges, and directs the visitor to **Try it with sample data**. The action is
visible in the first screen and opens `/demo`, a separate sample workspace.
This satisfies the special first-read/demo gate.

## Required claim checks

`.factory/claims.json` is present and contains 15 claims. From the fresh clone
with `npm ci --include=dev`, I ran every declared command individually against
the shipped demo entry point. Each selected one test and passed:

`weekly-occurrences`, `demo-isolated`, `offline-reload`, `private-data`,
`ics-export`, `sixty-day-window`, `csv-roundtrip`, `encrypted-backup`,
`pro-forecast`, `delete-all`, `device-storage`, `pro-price`, `cost-history`,
`high-value-warning`, and `verified-license-offline`.

Environment note: the first bare `npm ci` inherited this verifier container's
production omit setting and installed no dev tools, so test commands could not
resolve their executables. The package and lockfile do declare the pinned
tools; reinstalling the same clean clone with `npm ci --include=dev` installed
Playwright 1.58.2, TypeScript, ESLint, and Vitest and produced the passing
results above.

## Local quality gates

All commands below passed in that clean candidate clone:

```text
npm run typecheck    PASS
npm run lint         PASS
npm test             PASS — 2 files, 16 tests
npm run test:e2e     PASS — 24 tests
npm run build        PASS — dist/ produced
```

The production build is within the static-PWA budgets: JavaScript 28.62 kB
(10.24 kB gzip), CSS 11.45 kB (3.18 kB gzip), and hero WebP 71.48 kB.

## Independent product and live checks

- Normal flow: added a subscription, observed the immediate success notice,
  and confirmed it remained after reload in IndexedDB.
- Invalid/recovery flow: empty required fields exposed native required-field
  messages; an unsupported CSV currency showed a specific row error and was
  absent after reload. CSV export completed.
- Recurrence boundaries: unit tests cover every weekly occurrence in a month,
  monthly 31st-day clamping, annual schedules, and UTC noon date handling;
  the live demo's 60-day calendar and the individual weekly-claim test passed.
- Keyboard: the CSV file input is reached by Tab, its visible label has a
  `rgb(232, 91, 69)` solid 4px focus outline, Escape closes the add dialog and
  restores focus, and live dialog controls are at least 44px high.
- Mobile: at 390×844 the demo had no horizontal overflow and every visible
  link/button/file control measured at least 44px in both dimensions.
  `prefers-reduced-motion: reduce` yielded a `0s` occurrence transition.
- Accessibility: `/`, `/demo`, `/app`, `/privacy`, `/terms`, and `/404.html`
  each had one h1 and one main landmark, their own titles, no console/page
  errors, and zero axe serious/critical findings. The factory `verify-url.sh`
  also passed live: `lang=en`, title, one h1, main, all image alt attributes,
  and no unnamed buttons.
- PWA: the live `/demo` service worker controlled the page and a full offline
  reload kept the 60-day sample calendar visible. After the normal controlled
  reload, the app displayed `An app update is ready` and its `Reload now`
  action when receiving the update notification.
- Privacy: a fresh real-workspace browser flow (add, reload, invalid import,
  export) emitted only same-origin document/script/style requests and no
  external request. No bank-connection control was present. There are no
  third-party runtime scripts or font requests.
- Headers: the live root sends CSP with `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, HSTS, and
  `Referrer-Policy: strict-origin-when-cross-origin`. Hashed JS uses
  `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`.
  An unknown route returned HTTP 404 and the styled 404 page.
- License endpoint allowance: 40 sequential invalid verification requests from
  one client yielded 30 × HTTP 200 followed by 10 × HTTP 429. The first 429
  included `Retry-After: 3` and the documented product-origin CORS header.
  There is no sign-in or product backend beyond this billing verification
  endpoint, so Entra, backend persistence/concurrency, and package-consumer
  checks do not apply.

## Deployment identity and performance

Fresh live downloads were byte-identical to this candidate's `dist/` for
`index.html`, `sw.js`, `manifest.webmanifest`, the hashed JS and CSS, and the
hero WebP. Their SHA-256 values respectively were:

```text
faab4bd78f9f04fc3b885b134ae9b7a1d0a0a4f212419e5ab5ecebaf95b7c86d
10d419dbd9d4f17882c88dbedda6f14b71c8c265e116f76da2b7669af242923c
3d7823c36536dfb747b6f54eff4ede6efa4c2bb9d77c003dc2bc951dae8622a1
178daa524408526a6432491ad889ce57b604b827e93b8187d870a573b596c8ab
29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901
d396c4ad0439fee2d13399ed25ffa1d8538ad952651a3a26e715f9648a7b4f83
```

Live mobile Lighthouse (v12.6.0 with the installed Playwright Chromium)
reported Performance 98, Accessibility 100, Best Practices 100, LCP 2.0 s,
CLS 0, and TBT 0 ms.

## Handoff condition

Do not release this candidate as complete until the P2 plain-words 404 heading
is corrected and independently rechecked. All other evidence supports the
candidate and the live deployment; the earlier reported deployment-only issue
is not present.
