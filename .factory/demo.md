# Demo sandbox

- **URL:** `/demo` or `/?demo=1`
- **Sample:** six realistic subscriptions: Linear, OpenAI API, AWS, PostHog,
  office cleaning, and business insurance. The weekly cleaner exposes multiple
  occurrences in a calendar month.
- **Storage boundary:** demo uses the IndexedDB database
  `renewal-ledger:demo:subscriptions`; real data uses
  `renewal-ledger:real:subscriptions`. Demo mode never reads or writes the
  real database.
- **Reset:** choose **Reset demo** in the persistent yellow banner.
- **Leave:** choose **Start for real**. This clears only the demo database and
  opens a blank real workspace.
- **Offline check:** visit `/demo` once, then use browser offline mode and
  reload. The service worker caches the shell and the sample is local.
