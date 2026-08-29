# Adversarial first-read review 1 — FAIL

**Product:** Subscription Renewal Calendar

**Live URL:** https://subscription-renewal-calendar.sociobot.in

**Candidate:** `c94d95222c8825f0442c1e9f5ff89ea9b62ca27e`

**Reviewed:** 2026-08-29 UTC

**Verdict:** **FAIL — 25 findings remain (0 blocking, 6 major, 19 minor).**

The mandatory first-read and demo gates pass. The product still cannot pass
under the required zero-finding rule. Public behavior claims are missing from
the claims registry, the exported encrypted backup has no restore path, copy
breaks the plain-words rules, and several route-structure details remain.

## 1. Cold first screen

Fresh Chromium contexts were opened without stored site data at 390×844 and
1440×900. No scrolling occurred before this assessment.

- What it does, in my words: shows upcoming recurring charges before their
  renewal dates.
- For whom: small teams that need to assign a cost, owner, and decision to each
  recurring charge.
- What I should click first: **Try it with sample data**; the adjacent text says
  it loads a 60-day calendar.

The exact first-screen copy was:

> See renewals before they charge.
>
> For small teams that need a cost, owner, and decision before every recurring
> charge.
>
> Try it with sample data
>
> Loads a working 60-day calendar.

All three questions are answered above the fold at both sizes. This gate is
not blocking. The mandatory privacy/offline/price fact pattern is not fully
met; see F-1-2.

## 2. Findings

### Major

#### F-1-1 — An encrypted backup cannot be restored

- **Location/quote:** `/demo`, `/app`, and README: **Encrypted backup** / “a
  password-protected JSON file.”
- **Why this fails:** the product downloads an encrypted file but exposes no
  decrypt/import action. A normal person expects a backup to recover their
  data. CSV import cannot recover cost history and is not a replacement for
  the advertised backup format.
- **Concrete fix:** add **Restore encrypted backup**. Ask for the passphrase,
  decrypt locally, validate the version and every record, preview the result,
  then let the user merge or replace. Keep demo restores in the demo namespace.
  Add clean round-trip, wrong-passphrase, corrupt-file, and demo-isolation claim
  tests.

#### F-1-2 — The landing page makes a broader, unlisted offline claim

- **Location/quote:** landing eyebrow: “OFFLINE RENEWAL CONTROL”; first-screen
  facts: “Runs on this device”, “Exports calendar reminders”, “$19 once for Pro
  forecasts.”
- **Why this fails:** `offline-reload` is listed only as “The demo stays
  available offline after the first visit” and tests `/demo`. The landing label
  implies the whole product works offline. It is also jargon rather than a
  useful section label, and the required three facts do not state offline use
  plainly.
- **Concrete fix:** replace the eyebrow with “SUBSCRIPTION RENEWAL CALENDAR.”
  Add “Works offline after your first visit” as a first-screen fact only after a
  claims entry tests the real `/app` workspace offline; otherwise say “The demo
  works offline after your first visit.”

#### F-1-3 — Manual creation is an unlisted claim

- **Location/quote:** landing, How it works: “Bring a CSV, or add the first
  charge by hand.”
- **Why this fails:** `csv-roundtrip` covers CSV, but no claims entry names and
  tests the manual-add promise from a clean workspace.
- **Concrete fix:** add a `manual-add` claims entry and one tagged test that
  creates a subscription, verifies every saved field, reloads, and confirms the
  correct renewal appears.

#### F-1-4 — Owner and review-date entry are unlisted claims

- **Location/quote:** landing, How it works: “Name an owner. Add a review date
  before each charge.”
- **Why this fails:** no claim in `.factory/claims.json` promises or tests these
  two visible workflow outcomes.
- **Concrete fix:** add one precise claim and tagged test that saves an owner
  and review lead time and verifies the resulting review date, or remove this
  step from the landing page.

#### F-1-5 — Editing the keep/review/cancel decision is an unlisted claim

- **Location/quote:** landing, How it works: “Edit a subscription to mark it
  keep, review, or cancel.”
- **Why this fails:** `cost-history` tests an amount edit, not a decision edit.
  No listed claim asserts that all three decisions can be saved and restored.
- **Concrete fix:** add a `decision-edit` claim and tagged test that changes the
  decision, reloads, and verifies the list and occurrence state.

#### F-1-6 — The terms page makes an unlisted purchase-policy claim

- **Location/quote:** `/terms`: “Refunds and license status follow the checkout
  terms.”
- **Why this fails:** the sentence neither links to those terms nor has a
  claims entry. A buyer cannot identify the refund rules they are being asked
  to rely on.
- **Concrete fix:** replace it with a direct, durable link to the applicable
  Sociobot purchase/refund terms and test that link, or remove the sentence.

### Minor

#### F-1-7 — The product has two unexplained names

- **Location/quote:** page title and README heading: “Subscription Renewal
  Calendar”; site wordmark and README body: “Renewal Ledger.”
- **Why this fails:** a first-time visitor cannot tell whether Renewal Ledger
  is the product, a mode, or a different service.
- **Concrete fix:** choose one product name and use it in the title, wordmark,
  README, legal pages, manifest, and export metadata. If Renewal Ledger is a
  deliberate brand, introduce it once: “Subscription Renewal Calendar, called
  Renewal Ledger in the app.”

#### F-1-8 — A landing heading is a slogan, not a section name

- **Location/quote:** “A date without an owner is not a plan.”
- **Why this fails:** heard in a headings list, it does not say that the section
  is a sample renewal list.
- **Concrete fix:** “Sample renewal decision list.”

#### F-1-9 — The art caption contains visitor-irrelevant provenance copy

- **Location/quote:** “Generated original art.”
- **Why this fails:** this does not help a visitor use or evaluate the renewal
  calendar. It is also a claim with no claims-registry entry. Provenance is
  already recorded in `.factory/design.md`.
- **Concrete fix:** delete the sentence. Keep the useful privacy sentence:
  “Your subscriptions stay in this browser.”

#### F-1-10 — The footer uses a metaphorical slogan

- **Location/quote:** “Local renewal dates, with a human attached.”
- **Why this fails:** “a human attached” is brand mood, not a plain description
  of owner assignment.
- **Concrete fix:** “Track each renewal date with its owner.”

#### F-1-11 — One README sentence exceeds 22 words

- **Location/quote (29 words):** “Edit a subscription when its cost, owner,
  review lead time, note, or decision changes; the calendar records cost
  changes and can flag high-value charges with too little lead time.”
- **Why this fails:** it combines editing, history, and warning behavior in one
  sentence.
- **Concrete fix:** “Edit the cost, owner, review date, note, or decision. The
  calendar records cost changes. It flags expensive charges with less than
  seven days to review.”

#### F-1-12 — The README heading “Use it” is unclear out of context

- **Location/quote:** README heading: “Use it.”
- **Why this fails:** a headings list does not say what “it” is.
- **Concrete fix:** “Use the renewal calendar.”

#### F-1-13 — The README heading “License” is ambiguous

- **Location/quote:** README heading: “License.”
- **Why this fails:** the page also discusses a paid Pro license, while this
  heading means the repository’s MIT license.
- **Concrete fix:** “Open-source license.”

#### F-1-14 — The README uses unexplained SaaS jargon

- **Location/quote:** “Renewal Ledger is for small teams that pay for SaaS and
  operating subscriptions.”
- **Why this fails:** “SaaS” is unnecessary jargon in user-facing setup copy.
- **Concrete fix:** “Subscription Renewal Calendar is for small teams that pay
  for software and operating subscriptions.”

#### F-1-15 — The README leads with a CSV specification number

- **Location/quote:** “Add subscriptions one at a time, or import an RFC 4180
  CSV with these headings:”
- **Why this fails:** the specification number makes the first instruction
  harder to scan.
- **Concrete fix:** “Add subscriptions one at a time, or import a standard CSV
  with these headings:” Put “RFC 4180” in a later technical note if needed.

#### F-1-16 — The README exposes a storage implementation without explanation

- **Location/quote:** “Subscriptions are stored in IndexedDB.”
- **Why this fails:** “IndexedDB” does not tell a non-developer what happens to
  their data.
- **Concrete fix:** “Subscriptions stay in this browser. The app uses the
  browser’s IndexedDB storage.”

#### F-1-17 — The README uses “billing endpoint” jargon

- **Location/quote:** “Checkout and license verification use the Sociobot
  billing endpoint.”
- **Why this fails:** “endpoint” is an implementation term, not purchase
  guidance.
- **Concrete fix:** “Sociobot handles checkout and license checks.”

#### F-1-18 — The README leaves “PWA” unexplained

- **Location/quote:** “Serve `dist/` to test the service worker and installable
  PWA.”
- **Why this fails:** the acronym is unnecessary even in the short deployment
  instruction.
- **Concrete fix:** “Serve `dist/` to test offline use and installation as a
  web app.”

#### F-1-19 — One product control is not a result-naming verb

- **Location/quote:** `/demo` and `/app` toolbar button: “Encrypted backup.”
- **Why this fails:** it names an object, unlike the adjacent Export controls.
- **Concrete fix:** “Export encrypted backup.”

#### F-1-20 — Route metadata describes and canonicalizes every SPA route as home

- **Location/quote:** `/demo`, `/app`, `/privacy`, and `/terms` all expose
  canonical `https://subscription-renewal-calendar.sociobot.in/`, landing-page
  description “See subscription renewals, owners, and review dates before your
  team is charged.”, and landing-page Open Graph title. The direct 404 has no
  description, canonical, Open Graph, or Twitter metadata.
- **Why this fails:** privacy, terms, demo, and app URLs are real destinations,
  but their metadata says they are duplicates of the landing page.
- **Concrete fix:** update canonical, description, Open Graph title/description,
  and Twitter metadata on every render. Add the corresponding metadata to the
  static 404 document.

#### F-1-21 — The Apple touch icon does not meet the required asset contract

- **Location/quote:** `<link rel="apple-touch-icon"
  href="/icons/icon-192.svg">`.
- **Why this fails:** the site-structure contract requires a 180 px Apple touch
  icon; this is a 192×192 SVG.
- **Concrete fix:** ship a real 180×180 PNG and reference it with
  `sizes="180x180"`.

#### F-1-22 — The 390 px header hides the Calendar route

- **Location/quote:** mobile header shows only “Demo” and “Privacy”; CSS hides
  `.site-header nav a:nth-child(2)` at `max-width:390px`.
- **Why this fails:** the required consistent header loses the product’s main
  real-workspace link on the exact review viewport.
- **Concrete fix:** keep Calendar visible and wrap or tighten the header without
  reducing the 44 px targets.

#### F-1-23 — Route changes have no polite live announcement

- **Location/quote:** SPA navigation focuses the new `h1`, but the document has
  no route-status element with `aria-live="polite"`.
- **Why this fails:** this misses the explicit route-announcement requirement
  for screen-reader navigation.
- **Concrete fix:** add one visually hidden persistent polite live region and
  update it with the new page title after every route transition.

#### F-1-24 — Checkout is an external link without an external destination cue

- **Location/quote:** “Buy Pro for $19” points to `api.sociobot.in` and then
  redirects to `checkout.dodopayments.com`.
- **Why this fails:** the site-structure contract says external links identify
  themselves. The label does not tell a buyer that they are leaving the site.
- **Concrete fix:** use “Buy Pro for $19 at secure checkout” and add accessible
  text such as “opens an external checkout.”

#### F-1-25 — The designed 404 has a stale footer version

- **Location/quote:** normal routes show `v1.0.1`; the HTTP 404 shows `v1.0.0`.
- **Why this fails:** the footer is not consistent across routes.
- **Concrete fix:** generate the 404 footer version from the same build value as
  the SPA.

## 3. Copy audit

Word counts use whitespace-delimited words. Navigation labels and separator
characters are not sentences; headings and actions are included so the
out-of-context and verb checks are complete. There are no banned marketing
adjectives on the landing page or in the README. The landing copy averages 5.9
words per listed line; README sentences average 11.4 words.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| OFFLINE RENEWAL CONTROL | 3 | F-1-2: jargon and broader unlisted claim |
| See renewals before they charge. | 5 | Pass |
| For small teams that need a cost, owner, and decision before every recurring charge. | 14 | Pass |
| Try it with sample data | 5 | Pass: result-naming action |
| Loads a working 60-day calendar. | 5 | Pass: `sixty-day-window` |
| Runs on this device | 4 | Pass: `device-storage` |
| Exports calendar reminders | 3 | Pass: `ics-export` |
| $19 once for Pro forecasts | 5 | Pass: `pro-price` and `pro-forecast` |
| Generated original art. | 3 | F-1-9: not useful product copy |
| Your entries stay on your device. | 6 | Pass: `device-storage` / `private-data` |
| THE DECISION LIST | 3 | Pass |
| A date without an owner is not a plan. | 9 | F-1-8: slogan heading |
| How the renewal calendar works | 5 | Pass |
| Import your list. | 3 | Pass: `csv-roundtrip` |
| Bring a CSV, or add the first charge by hand. | 10 | F-1-3: manual-add claim unlisted |
| Name an owner. | 3 | F-1-4: claim unlisted |
| Add a review date before each charge. | 7 | F-1-4: claim unlisted |
| Decide in time. | 3 | Pass as a step label |
| Edit a subscription to mark it keep, review, or cancel. | 10 | F-1-5: claim unlisted |
| What this does not do | 5 | Pass |
| It does not connect to your bank, move money, or send your subscriptions elsewhere. | 14 | Pass: `private-data` |
| You control the exports and deletion. | 6 | Pass: export and `delete-all` claims |
| OPTIONAL ONE-TIME UPGRADE | 3 | Pass |
| Plan farther ahead with Pro. | 5 | Pass |
| Pro costs $19 once. | 4 | Pass: `pro-price` |
| It adds a 12-month forecast grouped by currency. | 8 | Pass: `pro-forecast` |
| Core tracking, CSV, ICS, encrypted backups, and deletion stay free. | 10 | Pass: `pro-price` |
| Buy Pro for $19 | 4 | F-1-24: external destination not stated |
| Restore a license in the calendar | 6 | Pass: result-naming action |
| Local renewal dates, with a human attached. | 7 | F-1-10: metaphorical slogan |

The live app’s other controls were also checked. **Encrypted backup** is the
only control that fails the result-naming verb rule; see F-1-19.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| See subscription renewals before they charge. | 6 | Pass |
| Renewal Ledger is for small teams that pay for SaaS and operating subscriptions. | 13 | F-1-7, F-1-14 |
| It keeps the amount, owner, review date, and keep-or-cancel decision together. | 11 | Pass |
| Data stays in the browser on the device that creates it. | 11 | Pass |
| Edit a subscription when its cost, owner, review lead time, note, or decision changes; the calendar records cost changes and can flag high-value charges with too little lead time. | 29 | F-1-11: over 22 words |
| Open `/demo` or add `?demo=1` to load a separate sample workspace. | 11 | Pass |
| It includes monthly software, a weekly cleaner, and an annual insurance renewal. | 12 | Pass |
| The banner can reset the sample or start a blank real workspace. | 12 | Pass |
| Add subscriptions one at a time, or import an RFC 4180 CSV with these headings: | 15 | F-1-15: specification jargon |
| `frequency` must be `weekly`, `monthly`, or `annual`. | 7 | Pass |
| Dates use `YYYY-MM-DD`. | 3 | Pass |
| `currency` must be `USD`, `EUR`, `GBP`, or `INR`; totals stay grouped by currency rather than being converted or added together. | 20 | Pass |
| `review_days` must be a whole number from 0 to 365. | 10 | Pass |
| The calendar shows each weekly occurrence, even when several land in one month. | 13 | Pass |
| Use **Export ICS reminders** for review-date calendar events, **Export CSV** for a spreadsheet copy, and **Encrypted backup** for a password-protected JSON file. | 22 | Pass at the hard cap |
| Subscriptions are stored in IndexedDB. | 5 | F-1-16: unexplained implementation term |
| There are no bank connections, trackers, or runtime third-party scripts. | 10 | Pass |
| See `/privacy` and `/terms` for details. | 6 | Pass |
| The free calendar includes local tracking, CSV import/export, ICS reminders, encrypted backup, and deletion. | 14 | Pass |
| Pro is a $19 one-time license for the 12-month forecast, grouped by currency. | 13 | Pass |
| Checkout and license verification use the Sociobot billing endpoint. | 9 | F-1-17: implementation jargon |
| A forecast appears only after a valid license verification; a previously verified license stays available offline. | 16 | Pass |
| `npm run build` writes the static deploy artifact to `dist/`, with `index.html` at its root. | 15 | Pass |
| Serve `dist/` to test the service worker and installable PWA. | 10 | F-1-18: unexplained acronym |
| MIT. | 1 | Pass |
| See [LICENSE](LICENSE). | 2 | Pass |

README heading audit:

| Heading | Words | Result |
| --- | ---: | --- |
| Subscription Renewal Calendar | 3 | Pass, subject to F-1-7 |
| Use it | 2 | F-1-12: unclear out of context |
| Privacy and Pro | 3 | Pass |
| Develop, test, and deploy | 4 | Pass |
| License | 1 | F-1-13: ambiguous with Pro license |

Terminology check: `subscription` is the record, `renewal` is its scheduled
charge, `owner` is the responsible teammate, `review date` is the decision
deadline, `demo` is the sample workspace, and `Pro` is the paid tier. Those
terms are otherwise consistent. The product-name inconsistency is F-1-7.

## 4. Demo and sandbox evidence

The one-click demo gate passes.

- A fresh landing-page click opened `/demo` in one click.
- The first demo screen immediately showed six realistic records: Linear,
  OpenAI API, AWS, PostHog, Office cleaner, and Business insurance. The visible
  60-day list contained repeated weekly Office cleaner occurrences.
- The persistent banner read “Demo — sample data, nothing is saved” and exposed
  **Reset demo** and **Start for real**.
- Deleting Linear and selecting **Reset demo** restored all of its occurrences
  and the inventory record.
- A real sentinel created in `/app` never appeared in demo. Leaving demo and
  returning to `/app` restored the sentinel. IndexedDB showed distinct
  `renewal-ledger:demo:subscriptions` and
  `renewal-ledger:real:subscriptions` databases.
- The full observed landing → demo → reset → real → demo → real flow made only
  same-origin requests and logged no console or page errors.
- A separate live Playwright context installed the service worker, switched
  offline, and reloaded `/demo`. The banner, Linear, and all weekly Office
  cleaner occurrences remained visible; every logged request was same-origin
  and none failed.
- The registered `offline-reload` test also passed from a clean local browser
  context after service-worker installation.

## 5. Claims audit

The repository was freshly cloned from GitHub to
`/tmp/subscription-review1-clean-20260829`. Its HEAD was the requested
`c94d95222c8825f0442c1e9f5ff89ea9b62ca27e`. After `npm ci --include=dev`,
every exact `test` command in `.factory/claims.json` was run separately.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `weekly-occurrences` | `npm run test:e2e -- --grep @claim:weekly-occurrences` | PASS — 1 test |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS — 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1 test |
| `private-data` | `npm run test:e2e -- --grep @claim:private-data` | PASS — 1 test |
| `ics-export` | `npm run test:e2e -- --grep @claim:ics-export` | PASS — 1 test |
| `sixty-day-window` | `npm run test:e2e -- --grep @claim:sixty-day-window` | PASS — 1 test |
| `csv-roundtrip` | `npm run test:e2e -- --grep @claim:csv-roundtrip` | PASS — 1 test |
| `encrypted-backup` | `npm run test:e2e -- --grep @claim:encrypted-backup` | PASS — 1 test |
| `pro-forecast` | `npm run test:e2e -- --grep @claim:pro-forecast` | PASS — 1 test |
| `delete-all` | `npm run test:e2e -- --grep @claim:delete-all` | PASS — 1 test |
| `device-storage` | `npm run test:e2e -- --grep @claim:device-storage` | PASS — 1 test |
| `pro-price` | `npm run test:e2e -- --grep @claim:pro-price` | PASS — 1 test |
| `cost-history` | `npm run test:e2e -- --grep @claim:cost-history` | PASS — 1 test |
| `high-value-warning` | `npm run test:e2e -- --grep @claim:high-value-warning` | PASS — 1 test |
| `verified-license-offline` | `npm run test:e2e -- --grep @claim:verified-license-offline` | PASS — 1 test |

No listed claim is untested or failing. F-1-2 through F-1-6 and F-1-9 identify
public claim-like copy with no matching registry entry.

## 6. History re-check

Before this review, there were no earlier `.factory/review-*.md` or
`.factory/polish-*.md` files. The earlier handoff records one repair finding:
checkout-return tokens were not verified immediately when a cached invalid
verdict existed.

That finding is confirmed fixed in both code and the live site:

- The source starts `verifyAndStoreLicense` for an incoming `?license=` token,
  removes the query parameter, and does not cache a valid verdict until a valid
  response arrives.
- On live, an intercepted valid response caused exactly one verification
  request, removed the query, saved a valid verdict, unlocked the forecast, and
  remained unlocked after reload without a second request.
- On live, an intercepted 503 kept the token, kept Pro locked, and showed the
  retry instruction. A subsequent valid response unlocked the forecast.

No previous handoff finding regressed.

## 7. Structure, accessibility, links, and identity

Verified passes:

- `/`, `/demo`, `/app`, `/privacy`, and `/terms` return 200; an unknown direct
  route returns the designed renewal-ledger 404 with HTTP 404 and a route home.
- Each normal route has `lang=en`, one `h1`, one `main`, a route-specific title,
  complete image alt text, and no load-time console/page error.
- SPA links use real paths. Forward navigation and browser Back update the
  route title, restore scroll, and focus the new page’s `h1`.
- All crawled internal links and assets returned 200. Checkout returned the
  expected 303 hosted-session redirect; no payment was submitted.
- The 1200×630 Open Graph image exists. `robots.txt`, `sitemap.xml`, SPA route
  rewrites, CSP, and the styled 404 exist.
- Axe found zero violations on all five normal routes at 390×844 and 1440×900.
  There was no horizontal overflow and no visible interactive target below
  44×44 px. Reduced-motion CSS removes the only transitions.
- Factory `verify-url.sh` passed `/` and `/demo` with one `h1`, `lang`, `main`,
  alt text, named buttons, and no console errors.
- The cream/ink/yellow/coral ledger-board treatment, hard rules, offset shadows,
  calendar artwork, and mobile decision list match `.factory/design.md` and are
  visually distinct from a generic centered-hero/feature-card SaaS template.

Findings F-1-20 through F-1-25 cover the remaining structure failures.

## 8. Other local verification

From the same fresh clone:

- `npm test` — PASS, 21 tests.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS; `dist/` produced. JS was 29.87 kB raw / 10.57 kB
  gzip, CSS 11.45 kB raw / 3.18 kB gzip, and hero art 71.48 kB.
- `npm run test:e2e` — PASS, 30 tests.

## What would make this perfect

Resolve all F-1-1 through F-1-25, then rerun the full review from a fresh
browser and fresh clone. In particular, make the encrypted backup restorable,
register or remove every public behavior claim, replace the flagged copy with
the supplied plain rewrites, and make metadata/header/footer/route
announcements complete on every route. The acceptance target is zero findings;
there is no residual “nice to have” list after those items pass.
