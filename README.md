# Subscription Renewal Calendar

See subscription renewals before they charge.

Renewal Ledger is for small teams that pay for SaaS and operating subscriptions.
It keeps the amount, owner, review date, and keep-or-cancel decision together.
Data stays in the browser on the device that creates it. Edit a subscription
when its cost, owner, review lead time, note, or decision changes; the calendar
records cost changes and can flag high-value charges with too little lead time.

## Use it

Open `/demo` or add `?demo=1` to load a separate sample workspace. It includes
monthly software, a weekly cleaner, and an annual insurance renewal. The banner
can reset the sample or start a blank real workspace.

Add subscriptions one at a time, or import an RFC 4180 CSV with these headings:

```csv
name,amount,currency,frequency,starts_on,owner,review_days,decision,note
AWS,410,USD,monthly,2026-09-08,Nia,14,review,Check last month’s cost
```

`frequency` must be `weekly`, `monthly`, or `annual`. Dates use `YYYY-MM-DD`.
`currency` must be `USD`, `EUR`, `GBP`, or `INR`; totals stay grouped by
currency rather than being converted or added together.
The calendar shows each weekly occurrence, even when several land in one month.
Use **Export ICS reminders** for review-date calendar events, **Export CSV** for
a spreadsheet copy, and **Encrypted backup** for a password-protected JSON file.

## Privacy and Pro

Subscriptions are stored in IndexedDB. There are no bank connections, trackers,
or runtime third-party scripts. See `/privacy` and `/terms` for details.

The free calendar includes local tracking, CSV import/export, ICS reminders,
encrypted backup, and deletion. Pro is a $19 one-time license for the 12-month
forecast, grouped by currency. Checkout and license verification use the
Sociobot billing endpoint. A forecast appears only after a valid license
verification; a previously verified license stays available offline.

## Develop, test, and deploy

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

`npm run build` writes the static deploy artifact to `dist/`, with `index.html`
at its root. Serve `dist/` to test the service worker and installable PWA.

## License

MIT. See [LICENSE](LICENSE).
