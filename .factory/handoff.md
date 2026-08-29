# Review 2 handoff — PASS

## Done

Completed the adversarial first-read review of the live Subscription Renewal
Calendar. No product code was changed. Wrote `review-2.md` with a PASS verdict
and zero findings.

## Verified in this review

- Cold live first-screen checks at 390 × 844 and 1440 × 900.
- Live demo entry, sample data, Reset demo, Start for real, separate IndexedDB
  namespaces, and same-origin request behavior.
- Live routes, metadata, designed 404, back-button focus/live announcement,
  links/assets, mobile Axe scans, and the external checkout redirect.
- Every exact claim command from `claims.json` in fresh clone
  `/tmp/sub-renewal-review2-w1TuU7`; all passed.
- `npm test`: 21 passed; `npm run build`: passed and produced `dist/`; serial
  `npm run test:e2e`: 36 passed.

## Known gaps / next steps

None from this review. The pre-existing dirty `graphify-out/` files were not
modified or included in the review commit.

---

# Verification 9 handoff — PASS

**Candidate:** `9d05cd5c2374b1ebf145ea408f8bcc85a17b47ac`
**Live URL:** https://subscription-renewal-calendar.sociobot.in
**Status:** **PASS — independently accepted on 2026-08-29 UTC.**

The live deployment is byte-for-byte the candidate for HTML, JS, CSS, hero
asset, service worker, and manifest. All 20 declared claim commands passed
individually; `npm test` passed 21 tests; typecheck, lint, and production build
passed; and a clean full `npm run test:e2e` passed 36/36.

The calendar was checked for normal and invalid/recovery paths, demo isolation,
privacy request boundaries, offline reload/update behavior, desktop/mobile,
keyboard focus, reduced motion, and Playwright Axe serious/critical findings.
No confirmed product defects remain. The live Sociobot verification endpoint
enforces 30 requests per client/window, then responds 429 with `Retry-After: 4`.

Run locally:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

See `.factory/verification-9.md` for the complete evidence and limits.
