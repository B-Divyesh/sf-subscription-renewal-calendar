# Handoff — Subscription Renewal Calendar v1.0.0

## Delivered

- A local-first renewal calendar for weekly, monthly, and annual subscriptions.
  Date-only UTC recurrence logic shows every weekly occurrence in a month and
  safely clamps monthly 29th–31st dates in shorter months.
- Owner, amount, review-days-early, and keep/review/cancel decisions on every
  subscription; an attention strip brings due reviews forward.
- Add form, CSV import with useful validation, CSV export, one-year ICS review
  reminders, AES-GCM encrypted JSON backup, individual delete with undo, and
  an empty state.
- `/demo` and `?demo=1` create a separate IndexedDB sample workspace with a
  persistent reset/start-real banner. `/privacy`, `/terms`, `/app`, and a
  styled 404 route are present.
- A one-time $19 Sociobot Pro path, return-token storage, cached optimistic
  unlock, restore-token form, and verification call. Pro reveals the practical
  12-month renewal forecast; all core data tools stay free.
- Install metadata, service worker, offline shell, security headers, robots,
  sitemap, favicon/icons, responsive styling, and generated original hero art.

## Verification

Ran on 2026-08-28:

```sh
npm test
npm run build
npm run test:e2e
```

Results: 5 recurrence/export unit tests passed; build wrote `dist/index.html`;
4 Playwright demo claim tests passed. The browser checks confirm the demo
redirect, separated sample UI, ICS download content, offline reload after the
service worker becomes ready, and no third-party request in the demo/export
flow. A 390 px Chromium screenshot was inspected; the calendar becomes a
single-column chronological list and controls remain 44 px targets.

Build output: JavaScript is 21.96 KB / 8.12 KB gzip, CSS is 9.82 KB / 2.85 KB
gzip, and the in-app hero WebP is 71.48 KB. The static Open Graph crop is 47 KB.
This is within the 200 KB JS, 50 KB CSS, and 300 KB image budgets.

`npx lighthouse` was attempted, but this container's packaged Chromium does
not expose the debugging connection Lighthouse requires. The browser smoke
checks above completed with no console errors.

## Known gaps and next steps

- CSV parsing intentionally supports simple comma-separated rows rather than
  quoted commas/newlines. Exported CSV is quoted, but a fuller RFC 4180 parser
  would be a worthwhile next iteration.
- Encrypted backups export now; password-protected backup import is not yet in
  v1. Regular CSV import remains available for recovery.
- License verification is optimistic while offline, then reconciles on the
  first visit and at most once per 24 hours when online.
