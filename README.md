# Subscription Renewal Calendar

See subscription renewals before they charge.

Subscription Renewal Calendar is for small teams that pay for software and operating subscriptions.
It keeps the amount, owner, review date, and decision together.
Subscriptions stay in this browser on the device that creates them.
Edit the cost, owner, review date, note, or decision.
The calendar records cost changes.
It flags expensive charges with less than seven days to review.

## Use the renewal calendar

Open `/demo` or add `?demo=1` to load a separate sample workspace.
It includes monthly software, a weekly cleaner, and an annual insurance renewal.
The banner can reset the sample or start a blank real workspace.

Add subscriptions one at a time, or import a standard CSV with these headings:

```csv
name,amount,currency,frequency,starts_on,owner,review_days,decision,note
AWS,410,USD,monthly,2026-09-08,Nia,14,review,Check last month’s cost
```

`frequency` must be `weekly`, `monthly`, or `annual`.
Dates use `YYYY-MM-DD`.
`currency` must be `USD`, `EUR`, `GBP`, or `INR`.
Totals stay grouped by currency rather than being converted or added together.
`review_days` must be a whole number from 0 to 365.
The calendar shows each weekly occurrence, even when several land in one month.
Use **Export ICS reminders** for review-date calendar events.
Use **Export CSV** for a spreadsheet copy.
Use **Export encrypted backup** for a password-protected JSON file.
Use **Restore encrypted backup** and its passphrase to recover that file.

## Privacy and Pro

Subscriptions stay in this browser.
The app uses the browser’s IndexedDB storage.
There are no bank connections, trackers, or runtime third-party scripts.
See `/privacy` and `/terms` for details.

The free calendar includes local tracking, CSV import and export, ICS reminders, backups, restores, and deletion.
Pro is a $19 one-time license for the 12-month forecast, grouped by currency.
Sociobot handles checkout and license checks.
A forecast appears only after a valid license verification.
A previously verified license stays available offline.

## Develop, test, and deploy

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

`npm run build` writes the static deploy artifact to `dist/`, with `index.html` at its root.
Serve `dist/` to test offline use and installation as a web app.

## Open-source license

MIT. See [LICENSE](LICENSE).
