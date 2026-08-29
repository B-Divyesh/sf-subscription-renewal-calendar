# Polish round 1 — review finding closure

**Base reviewed:** `c94d95222c8825f0442c1e9f5ff89ea9b62ca27e`  
**Review:** `.factory/review-1.md`  
**Repair commit:** pending final documentation commit  
**Local evidence:** fresh clone `/tmp/subscription-renewal-calendar-clean-4OIyjW` at `c664f38f06e1fce37997d01e92b1100ff9a4dcf9`; all 20 exact claim commands and the 36-test browser suite passed.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added AES-GCM restore: passphrase decryption, format and record validation, preview, merge/replace choice, and current-workspace persistence. | `@claim:backup-restore` covers round trip, wrong passphrase, corrupt file, demo restore, and leaving demo. |
| F-1-2 | Replaced the eyebrow and added the literal offline fact for the real workspace. | `@claim:offline-app-reload`. |
| F-1-3 | Registered and tested manual creation. | `@claim:manual-add`. |
| F-1-4 | Registered and tested owner plus calculated review date. | `@claim:owner-review-date`. |
| F-1-5 | Registered and tested each keep/review/cancel edit across reloads. | `@claim:decision-edit`. |
| F-1-6 | Removed the unsupported checkout-refund statement. | `/terms` metadata/link browser regression. |
| F-1-7 | Standardized product name in wordmark, README, manifest, ICS PRODID, and export filenames. | `manifest.webmanifest`, `domain.test.ts`, browser route checks. |
| F-1-8 | Renamed the preview heading to “Sample renewal decision list”. | Landing copy audit and browser landing check. |
| F-1-9 | Removed generated-art visitor copy; retained the useful local-storage sentence. | Landing copy audit. |
| F-1-10 | Replaced the footer slogan with an owner-specific description. | Browser footer link and route checks. |
| F-1-11 | Split the overlong README behavior sentence. | `.factory/copy-audit.md`. |
| F-1-12 | Renamed the README use heading. | `.factory/copy-audit.md`. |
| F-1-13 | Renamed the README repository-license heading. | `.factory/copy-audit.md`. |
| F-1-14 | Replaced SaaS jargon with software subscriptions. | `.factory/copy-audit.md`. |
| F-1-15 | Replaced the first CSV instruction with plain “standard CSV” wording. | `.factory/copy-audit.md`. |
| F-1-16 | Explained browser storage before naming IndexedDB. | README and `@claim:device-storage`. |
| F-1-17 | Replaced “billing endpoint” with purchase guidance. | README. |
| F-1-18 | Replaced unexplained PWA wording with “web app”. | README. |
| F-1-19 | Renamed the control to “Export encrypted backup”. | `@claim:encrypted-backup`. |
| F-1-20 | Set per-route title, description, canonical, Open Graph, and Twitter metadata; added complete static 404 metadata. | Browser test “sets distinct metadata…” and 404 regression. |
| F-1-21 | Added a real 180×180 PNG Apple touch icon and referenced it with `sizes="180x180"`. | `index.html`, built asset check. |
| F-1-22 | Kept the Calendar link visible at 390 px and tightened the header without shrinking targets. | 390 px mobile Playwright regression. |
| F-1-23 | Added a persistent polite route-status region, updated after route focus. | Focus and route-status browser regression. |
| F-1-24 | Named every purchase link as secure external checkout and included accessible external-destination text. | `@claim:pro-price`. |
| F-1-25 | Set the static 404 footer to the shared v1.0.2 build value. | Static 404 browser regression. |

## Current evidence

- Fresh-clone `npm test`: 21 passed.
- Fresh-clone `npm run typecheck`, `npm run lint`, and `npm run build`: passed.
- Fresh-clone `npm run test:e2e`: 36 passed, including axe, keyboard, mobile, privacy request, offline, demo, routing, metadata, and 404 coverage.
- All 20 commands listed in `.factory/claims.json` passed individually from the same fresh clone.

Live deployment and screenshot evidence are appended to this file after deployment.
