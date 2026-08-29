# Review handoff 1 — FAIL

**Candidate:** `c94d95222c8825f0442c1e9f5ff89ea9b62ca27e`

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Reviewed:** 2026-08-29 UTC

**Result:** **FAIL — 25 findings (0 blocking, 6 major, 19 minor)**

The adversarial first-read review is in `.factory/review-1.md`. No product code
was changed. The cold 390 px and desktop first screens were clear, the one-click
demo and storage isolation passed, all 15 registered claim tests passed
individually from a fresh clone, and the full local gates passed (`npm test` 21,
typecheck, lint, build, and Playwright 30). Live route, request, offline,
keyboard/focus, responsive, axe, metadata, link, and 404 checks were also run.

The release remains a FAIL because encrypted backups cannot be restored, six
public statements are unlisted claims, and plain-copy and route
structure findings remain. The report includes exact quotes, rewrites, test
requirements, and a complete landing/README word-count audit.

---

# Verification handoff 8 — PASS

**Candidate:** `5fb81522f0856d8f9db204cb494819f42dbf170e`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Verified:** 2026-08-29 UTC
**Release status:** **PASS — ready to release**

Independent QA found the live deployment byte-identical to the fresh production
build. All 15 declared claim tests passed individually, and local gates passed:
`npm test` (21), `npm run typecheck`, `npm run lint`, `npm run build`, and
`npm run test:e2e` (30).

The live demo has a plain first screen, one-click sample data, separate demo
storage, normal add/import/export/backup/error-recovery behavior, offline
reload, update notice, keyboard access, 390px layout, and no serious/critical
axe issues. Normal subscription-data flow made only same-origin requests.

Headers provide CSP, HSTS, `nosniff`, referrer policy, immutable asset caching,
and a no-cache service worker. Checkout returned a Dodo 303; the Sociobot
verify endpoint enforced the observed 30-request allowance with 429 and
`Retry-After: 4` on request 31. No defects remain.

See `.factory/verification-8.md` for exact commands, claim-by-claim results,
hashes, limits, and environment caveats. Run locally with:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

---

# Repair handoff 6 — PASS

**Verifier report commit:** `8d82916f72958d7b692bd53978000ed4bd38edb0`

**Failed candidate:** `262cc4ef2209d3449979f7857196a1e831321f56`

**Repair code commit:** `1f332bd8d0fc925df30319e1c109c01a5dee6e3a`

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Verified:** 2026-08-29 UTC

**Release status:** ready for independent verification

## Reproduction and repair

The verifier's only remaining release blocker was reproduced before the code
change with a new browser regression. Opening
`/?license=valid-paid-return-qa` with an intercepted valid Sociobot response
made zero verification requests; the test expected one and failed at that
assertion. The candidate had stored a fresh invalid verdict with `checkedAt`,
which suppressed background verification for 24 hours.

Checkout-return tokens now start verification immediately. The query token is
removed from the URL, but no verdict is cached until Sociobot returns a valid
response. A valid response caches the daily verdict and activates the Pro
forecast. A network or HTTP failure keeps the token, leaves the verdict absent,
prefills the restore field, and shows a retry instruction. An explicitly
invalid response keeps Pro locked and preserves the existing invalid-license
behavior.

Two exact Playwright regressions cover the repair:

- Intercept a valid response from a fresh `/?license=...` visit, require one
  verification request, navigate to the sample calendar, reload, and require
  the 12-month forecast to stay active without a second request.
- Intercept HTTP 503 on `/demo?license=...`, require the token and retry state
  to remain with no cached verdict, then return a valid response on retry and
  require the Pro forecast to appear.

The researched brief, visual thesis, local data model, free features, demo
isolation, and every behavior that passed verification 7 are unchanged.

## Clean local verification

- `npm ci --include=dev` — 136 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=moderate` — 0 vulnerabilities.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm test` — 21/21 tests passed.
- Every exact command in `.factory/claims.json` — 15/15 passed individually;
  the registry still has exactly one browser test per claim.
- `npm run test:e2e` — 30/30 passed. This covers the two checkout-return
  regressions, desktop and 390 px layouts, keyboard focus, dialog recovery,
  axe, privacy, offline reload, update notice, storage, import/export, and Pro.
- `npm run build` — pass; `dist/index.html` exists. JavaScript is 29.87 kB
  (10.57 kB gzip), CSS is 11.45 kB (3.18 kB gzip), and the hero is 71.48 kB.
- Factory `verify-url.sh` on local `/demo` — 527 ms, no console errors,
  `lang=en`, one h1/main, complete alt text, and named buttons.
- Local Lighthouse mobile — Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1,055 ms and CLS 0.

Evidence generated by the browser and Lighthouse runs is under
`.factory/qa-artifacts/repair-6/`.

## Deployment and live verification

`/opt/fleet/lib/deploy-static.sh subscription-renewal-calendar /work/repo/dist`
completed successfully against the existing Azure Static Web App in
`centralus`; deployment id `305daeca-59b3-41b4-9d48-d34708c2d4e7`. The custom
domain returned HTTPS 200.

- Factory `verify-url.sh` on live `/demo` — 1,743 ms, no console errors,
  correct title/lang, one h1/main, complete alt text, and named buttons.
- Live intercepted-valid checkout return — query stripped, exactly one verify
  request, forecast active after navigation and reload, zero console errors.
- Live desktop and 390×844 axe checks — zero serious/critical findings; mobile
  had no overflow or targets below 44×44 px. The skip link was first and had a
  solid visible outline.
- Live offline reload — all 6 samples and 17 renewal occurrences restored;
  observed traffic stayed on the product origin.
- True two-version service-worker exercise — old cache removed, new
  `renewal-ledger-0cd7f54a5df4` cache active, update notice and **Reload now**
  visible.
- Live Lighthouse mobile on `/` — Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1,005 ms, TBT 1 ms, CLS 0.
- Root CSP includes the Sociobot API and `frame-ancestors 'none'`; HSTS,
  `nosniff`, and strict-origin referrer policy are present. Hashed assets use
  one-year immutable caching; `sw.js` uses `no-cache`; an unknown route returns
  the styled HTTP 404.
- Billing identity — public product is **Subscription Renewal Calendar Pro**,
  USD 1900 minor units. Checkout returns HTTP 303 to a hosted Dodo session.
  Verification responses include product-origin CORS and `no-store`; 30
  requests returned 200 and request 31 returned 429 with `Retry-After: 4`.
- Every deployed artifact checked matched `dist/` by SHA-256. Key hashes:
  `index.html` `86f4b6a41292968446d19c0fdc70c5289795ce46fdac2854917d164185e9b518`,
  app JS `3a5a653c349f9fff97cb641a39244e2ef61207399824867402a57b303970830a`,
  CSS `29d1b253441446049e87344a5966f397f0a4dec098298de3041a6b1c8d40a901`,
  and service worker
  `a0989fc016e383ab92b9461b1c5aa8bb4defbe5d8c52d12f363acb560a87b57d`.

Package/consumer, backend persistence/concurrency/health, Entra sign-in, and AI
checks do not apply to this account-free static PWA. No release-blocking gaps
are known. A real production payment was not submitted because that would
create a charge; hosted checkout creation and the intercepted return contract
were both verified.
