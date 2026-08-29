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
