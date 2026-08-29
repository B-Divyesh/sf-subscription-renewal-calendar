# Adversarial first-read review 2 — PASS

**Product:** Subscription Renewal Calendar  
**Live URL:** https://subscription-renewal-calendar.sociobot.in  
**Reviewed:** 2026-08-29 UTC  
**Verdict:** **PASS — zero findings.**

This was a full repeat review, not a diff review. No blocking, major, minor,
unlisted-claim, or untested-claim finding remains.

## Cold first screen

Fresh Chromium contexts with no site data were opened at 390 × 844 and 1440 ×
900. No scrolling occurred before this assessment.

- It does: show upcoming subscription renewals before the charge date, with an owner and a decision.
- It is for: small teams managing recurring software and operating charges.
- Click first: **Try it with sample data**; the adjacent helper says it loads a working 60-day calendar.

The first screen answers all three questions at both sizes:

> See renewals before they charge.
>
> For small teams that need a cost, owner, and decision before every recurring charge.
>
> Try it with sample data
>
> Loads a working 60-day calendar.

The same screen gives three concrete facts: offline after the first visit,
calendar-reminder export, and the $19 one-time Pro forecast price. At 390 px,
the CTA remains above the fold and there is no horizontal overflow.

## Copy audit

Counts use whitespace-delimited words. Every landing and README sentence is at
or below 22 words. No banned marketing adjective, unexplained product term,
metaphor heading, or non-result-naming control was found.

### Landing page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| See renewals before they charge. | 5 | Pass |
| For small teams that need a cost, owner, and decision before every recurring charge. | 14 | Pass |
| Loads a working 60-day calendar. | 5 | Pass; sixty-day-window |
| Works offline after your first visit. | 6 | Pass; offline-app-reload |
| Exports calendar reminders. | 3 | Pass; ics-export |
| $19 once for Pro forecasts. | 5 | Pass; pro-price and pro-forecast |
| Your subscriptions stay in this browser. | 6 | Pass; device-storage |
| Add the first charge by hand or bring a CSV. | 10 | Pass; manual-add and csv-roundtrip |
| Save an owner and choose review days before each charge. | 10 | Pass; owner-review-date |
| Edit a subscription to keep, review, or cancel it. | 9 | Pass; decision-edit |
| It does not connect to your bank, move money, or send your subscriptions elsewhere. | 14 | Pass; private-data |
| You control exports and deletion. | 5 | Pass; export and delete-all claims |
| Pro costs $19 once. | 4 | Pass; pro-price |
| It adds a 12-month forecast grouped by currency. | 8 | Pass; pro-forecast |
| Core tracking, CSV, ICS, encrypted backups, and deletion stay free. | 10 | Pass; pro-price |

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| See subscription renewals before they charge. | 6 | Pass |
| Subscription Renewal Calendar is for small teams that pay for software and operating subscriptions. | 14 | Pass |
| It keeps the amount, owner, review date, and decision together. | 10 | Pass; manual, owner, and decision claims |
| Subscriptions stay in this browser on the device that creates them. | 11 | Pass; device-storage |
| Edit the cost, owner, review date, note, or decision. | 9 | Pass; edit claims |
| The calendar records cost changes. | 5 | Pass; cost-history |
| It flags expensive charges with less than seven days to review. | 11 | Pass; high-value-warning |
| Open /demo or add ?demo=1 to load a separate sample workspace. | 11 | Pass; demo entry checked live |
| It includes monthly software, a weekly cleaner, and an annual insurance renewal. | 12 | Pass; sample checked live |
| The banner can reset the sample or start a blank real workspace. | 12 | Pass; checked live |
| Add subscriptions one at a time, or import a standard CSV with these headings: | 14 | Pass |
| frequency must be weekly, monthly, or annual. | 7 | Pass; parser validation |
| Dates use YYYY-MM-DD. | 3 | Pass; parser validation |
| currency must be USD, EUR, GBP, or INR. | 8 | Pass; parser validation |
| Totals stay grouped by currency rather than being converted or added together. | 12 | Pass; grouped-total regression |
| review_days must be a whole number from 0 to 365. | 10 | Pass; bounds regression |
| The calendar shows each weekly occurrence, even when several land in one month. | 13 | Pass; weekly-occurrences |
| Use Export ICS reminders for review-date calendar events. | 8 | Pass; ics-export |
| Use Export CSV for a spreadsheet copy. | 7 | Pass; csv-roundtrip |
| Use Export encrypted backup for a password-protected JSON file. | 9 | Pass; encrypted-backup |
| Use Restore encrypted backup and its passphrase to recover that file. | 11 | Pass; backup-restore |
| Subscriptions stay in this browser. | 5 | Pass; device-storage |
| The app uses the browser’s IndexedDB storage. | 7 | Pass; device-storage |
| There are no bank connections, trackers, or runtime third-party scripts. | 10 | Pass; private-data |
| See /privacy and /terms for details. | 6 | Pass |
| The free calendar includes local tracking, CSV import and export, ICS reminders, backups, restores, and deletion. | 16 | Pass; feature claims |
| Pro is a $19 one-time license for the 12-month forecast, grouped by currency. | 13 | Pass; pro claims |
| Sociobot handles checkout and license checks. | 6 | Pass; checkout and verification tests |
| A forecast appears only after a valid license verification. | 9 | Pass; pro-forecast |
| A previously verified license stays available offline. | 7 | Pass; verified-license-offline |
| npm run build writes the static deploy artifact to dist/, with index.html at its root. | 15 | Pass; build checked |
| Serve dist/ to test offline use and installation as a web app. | 12 | Pass |
| MIT. See LICENSE. | 3 | Pass |

Heading/control check: **Sample renewal decision list**, **How the renewal
calendar works**, **What this does not do**, and **Plan farther ahead with Pro**
name their sections. **Try it with sample data**, **Add subscription**,
**Import CSV**, **Export ICS reminders**, **Export CSV**, **Export encrypted
backup**, **Restore encrypted backup**, **Reset demo**, and **Start for real**
name their results.

## Demo and sandbox

The direct /demo route opened a working calendar with six plausible records:
Linear, OpenAI API, AWS, PostHog, Office cleaner, and Business insurance. The
first post-click mobile screen already showed the 60-day calendar, totals,
owners, and usable controls.

The persistent banner read **“Demo — sample data, nothing is saved.”** Reset
demo restored the original sample. Start for real opened an empty real
workspace without the banner or sample rows. Browser inspection confirmed the
separate IndexedDB names renewal-ledger:demo:subscriptions and
renewal-ledger:real:subscriptions.

Live landing and demo flows made only same-origin requests for page assets. The
clean-clone private-data claim records a real-data add/export flow and passed.
Clean-context service-worker reload claims passed for both /demo and /app.

## Claim registry

All 20 exact commands from .factory/claims.json were run in a fresh clone at
/tmp/sub-renewal-review2-w1TuU7. Each passed; the clone's final Playwright
result was status passed with no failed tests.

| Claims confirmed |
| --- |
| weekly-occurrences, demo-isolated, offline-reload, offline-app-reload, private-data |
| ics-export, sixty-day-window, csv-roundtrip, encrypted-backup, backup-restore |
| manual-add, owner-review-date, decision-edit, pro-forecast, delete-all |
| device-storage, pro-price, cost-history, high-value-warning, verified-license-offline |

The landing and README claim-like statements map to these entries or their
covered parser/browser regressions. No unsupported public promise was found.

## Earlier-review closure

Every finding in review-1 was rechecked on the deployed site and against code.

| Earlier id | Confirmation |
| --- | --- |
| F-1-1 | Restore preview, passphrase handling, merge/replace, and backup-restore are present. |
| F-1-2 | The literal offline fact and offline-app-reload test are present. |
| F-1-3 | Manual add and manual-add are present. |
| F-1-4 | Owner/review workflow and owner-review-date are present. |
| F-1-5 | Keep/review/cancel edits and decision-edit are present. |
| F-1-6 | The unsupported checkout-refund statement is absent. |
| F-1-7 | Product naming is consistently Subscription Renewal Calendar. |
| F-1-8 | Preview heading is Sample renewal decision list. |
| F-1-9 | Visitor-facing generated-art provenance copy is absent. |
| F-1-10 | Footer describes owner tracking, not a slogan. |
| F-1-11 | The long README edit/history sentence is split. |
| F-1-12 | README heading is Use the renewal calendar. |
| F-1-13 | README heading is Open-source license. |
| F-1-14 | README uses software, not SaaS jargon. |
| F-1-15 | README says standard CSV, not an RFC number. |
| F-1-16 | README explains browser storage before IndexedDB. |
| F-1-17 | README does not use billing-endpoint jargon. |
| F-1-18 | README explains a web app, not unexplained PWA shorthand. |
| F-1-19 | Toolbar says Export encrypted backup. |
| F-1-20 | Live routes have distinct title, description, canonical, OG, and Twitter metadata. |
| F-1-21 | The live document references the 180 × 180 PNG Apple touch icon. |
| F-1-22 | The 390 px header shows Demo, Calendar, and Privacy. |
| F-1-23 | Client routes focus h1 and update polite route status. |
| F-1-24 | Purchase links name the secure external checkout. |
| F-1-25 | SPA and static 404 both show v1.0.2. |

## Structure and quality checks

- Live /, /demo, /app, /privacy, /terms, and an unknown route each had one h1,
  one main landmark, route-specific title/canonical, and no serious or critical
  Axe issue at 390 px.
- Back navigation returned focus to the landing h1 and updated the route-status
  announcement. The unknown route returned HTTP 404 and offered calendar home.
- Header/footer links, sitemap, robots, manifest, favicon, social image, Apple
  touch icon, privacy, terms, and hosted checkout were checked. Internal routes
  and assets returned expected responses; checkout returned its expected 303.
- The paper, ink, highlighter-yellow, coral, and ledger-board system matches
  design.md, is product-specific, and is not a generic SaaS template.
- No additional AI, sync, or import/export feature is implied by the brief. The
  app already provides import, CSV/ICS export, encrypted backup/restore,
  offline operation, and local-first storage. No decorative or keyed AI exists.
- Local verification: npm test passed 21 tests; npm run build produced dist/
  with 11.74 kB gzip JavaScript; serial npm run test:e2e passed 36 tests.

## What would make this perfect

No corrective product work is required for this review. Preserve the present
claim-test mapping, isolated demo boundary, route metadata, and plain first
screen when adding future functionality.

