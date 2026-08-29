import { expect, test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const dayMs = 86_400_000;
const addUtcDays = (day: string, amount: number) => new Date(Date.parse(`${day}T12:00:00Z`) + amount * dayMs).toISOString().slice(0, 10);

test('@claim:demo-isolated keeps real and demo workspaces separate across navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo mode')).toContainText('sample data, nothing is saved');
  await expect(page.getByText('Office cleaner', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('REAL SENTINEL');
  await dialog.getByLabel('Amount').fill('12');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByText('Office cleaner', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('REAL SENTINEL', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.locator('.subscription-list').getByRole('heading', { name: 'REAL SENTINEL' })).toBeVisible();
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByText('Office cleaner', { exact: true }).first()).toBeVisible();
});

test('@claim:weekly-occurrences shows every weekly sample renewal in the demo window', async ({ page }) => {
  await page.goto('/demo');
  const from = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const through = addUtcDays(from, 60);
  let expectedDay = '2026-08-28';
  while (expectedDay < from) expectedDay = addUtcDays(expectedDay, 7);
  const expected: string[] = [];
  while (expectedDay <= through) { expected.push(expectedDay); expectedDay = addUtcDays(expectedDay, 7); }
  const rows = page.locator('.calendar .occurrence').filter({ has: page.getByRole('heading', { name: 'Office cleaner', exact: true }) });
  await expect(rows).toHaveCount(expected.length);
  expect(await rows.locator('time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime')))).toEqual(expected);
});

test('@claim:sixty-day-window opens the complete 60-day sample calendar', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Your next 60 days of renewals' })).toBeVisible();
  const from = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const through = addUtcDays(from, 60);
  expect((Date.parse(`${through}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / dayMs).toBe(60);
  const range = await page.evaluate(({ start, end }) => {
    const format = (day: string) => new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
    return `${format(start)} to ${format(end)}`;
  }, { start: from, end: through });
  await expect(page.locator('.calendar .section-head span')).toHaveText(range);
  await expect(page.locator('.subscription-list article')).toHaveCount(6);
  expect(await page.locator('.calendar .occurrence').count()).toBeGreaterThan(0);
});

test('@claim:ics-export downloads usable reminders for the sample', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export ICS reminders' }).click();
  const text = await (await download).createReadStream().then(async (stream) => { const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk); return Buffer.concat(chunks).toString('utf8'); });
  expect(text).toContain('BEGIN:VCALENDAR');
  expect((text.match(/BEGIN:VEVENT/g) || []).length).toBeGreaterThan(1);
});

test('@claim:csv-roundtrip exports and imports commas and quotes without data loss', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('QA, "Monthly" tool');
  await dialog.getByLabel('Amount').fill('42.5');
  await dialog.getByLabel('First charge').fill('2026-08-28');
  await dialog.getByLabel('Owner').fill('Rae, Ops');
  await dialog.getByLabel('Note').fill('Said "keep it"\nafter review');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const csv = await (await import('node:fs/promises')).readFile(path!, 'utf8');
  page.once('dialog', (prompt) => prompt.accept());
  await page.getByRole('button', { name: 'Delete QA, "Monthly" tool' }).click();
  await page.getByLabel('Import CSV').setInputFiles({ name: 'roundtrip.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('.notice')).toContainText('Imported 1 subscription');
  const imported = page.locator('.subscription-list article').filter({ hasText: 'QA, "Monthly" tool' });
  await expect(imported.getByRole('heading', { name: 'QA, "Monthly" tool', exact: true })).toBeVisible();
  await expect(imported).toContainText('Owner: Rae, Ops');
  await expect(imported).toContainText('review 7 days early · review');
  const secondDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const secondPath = await (await secondDownload).path();
  expect(await (await import('node:fs/promises')).readFile(secondPath!, 'utf8')).toBe(csv);
});

test('Cancel, close, and Escape dismiss without saving and restore focus', async ({ page }) => {
  await page.goto('/app');
  const add = page.getByRole('button', { name: 'Add subscription' });
  for (const dismiss of ['Cancel', 'Close', 'Escape']) {
    await add.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill(`${dismiss} should not save`);
    await dialog.getByLabel('Amount').fill('12');
    await dialog.getByLabel('Owner').fill('Rae');
    if (dismiss === 'Escape') await page.keyboard.press('Escape');
    else await dialog.getByRole('button', { name: dismiss }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(`${dismiss} should not save`, { exact: true })).toHaveCount(0);
    await expect(add).toBeFocused();
  }
  await page.reload();
  await expect(page.getByText(/should not save/)).toHaveCount(0);
});

test('invalid dates and decisions show row-specific errors without persistence', async ({ page }) => {
  await page.goto('/app');
  await page.getByLabel('Import CSV').setInputFiles({ name: 'invalid-date.csv', mimeType: 'text/csv', buffer: Buffer.from('name,amount,frequency,starts_on,owner\nBad date,10,monthly,2026-02-30,Rae') });
  await expect(page.locator('.notice')).toContainText('Row 2 has an invalid starts_on date');
  await page.getByLabel('Import CSV').setInputFiles({ name: 'invalid-decision.csv', mimeType: 'text/csv', buffer: Buffer.from('name,amount,frequency,starts_on,owner,decision\nBad decision,10,monthly,2026-02-28,Rae,maybe') });
  await expect(page.locator('.notice')).toContainText('Row 2 has an invalid decision');
  await page.reload();
  await expect(page.getByText('Bad date', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Bad decision', { exact: true })).toHaveCount(0);
});

test('bounds review days in the form and CSV before persistence', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('Huge review poison');
  await dialog.getByLabel('Amount').fill('10');
  await dialog.getByLabel('Owner').fill('Rae');
  const reviewDays = dialog.getByLabel('Review days early');
  await expect(reviewDays).toHaveAttribute('max', '365');
  await reviewDays.fill('200000000');
  expect(await reviewDays.evaluate((input: HTMLInputElement) => ({ valid: input.checkValidity(), overflow: input.validity.rangeOverflow }))).toEqual({ valid: false, overflow: true });
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  await expect(dialog).toBeVisible();
  await page.reload();
  await expect(page.getByText('Huge review poison', { exact: true })).toHaveCount(0);

  await page.getByLabel('Import CSV').setInputFiles({
    name: 'huge-review.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,amount,frequency,starts_on,owner,review_days\nHuge CSV review,10,monthly,2026-08-28,Rae,200000000')
  });
  await expect(page.locator('.notice')).toContainText('Row 2 has invalid review_days. Use a whole number from 0 to 365.');
  await page.reload();
  await expect(page.getByText('Huge CSV review', { exact: true })).toHaveCount(0);
});

test('removes poisoned IndexedDB rows while preserving valid subscriptions and controls', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/app');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('renewal-ledger:real:subscriptions', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('subscriptions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('subscriptions', 'readwrite');
      const store = transaction.objectStore('subscriptions');
      store.clear();
      store.put({ id: 'valid-row', name: 'Valid renewal', amount: 10, currency: 'USD', frequency: 'monthly', startsOn: '2026-08-28', owner: 'Rae', reviewDays: 7, decision: 'review' });
      store.put({ id: 'poison-row', name: 'Poisoned renewal', amount: 10, currency: 'USD', frequency: 'monthly', startsOn: '2026-08-28', owner: 'Rae', reviewDays: 200_000_000, decision: 'review' });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your next 60 days of renewals' })).toBeVisible();
  await expect(page.locator('.notice')).toContainText('An invalid saved entry was removed');
  await expect(page.locator('.subscription-list').getByRole('heading', { name: 'Valid renewal' })).toBeVisible();
  await expect(page.getByText('Poisoned renewal', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add subscription' })).toBeVisible();
  expect(await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('renewal-ledger:real:subscriptions', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<string[]>((resolve, reject) => {
      const request = db.transaction('subscriptions').objectStore('subscriptions').getAll();
      request.onsuccess = () => resolve(request.result.map((item: { id: string }) => item.id));
      request.onerror = () => reject(request.error);
    });
  })).toEqual(['valid-row']);
  await page.reload();
  await expect(page.locator('.subscription-list').getByRole('heading', { name: 'Valid renewal' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('@claim:encrypted-backup downloads ciphertext without plaintext subscription data', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', (prompt) => prompt.accept('correct horse battery staple'));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Encrypted backup' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const contents = await (await import('node:fs/promises')).readFile(path!, 'utf8');
  expect(JSON.parse(contents)).toEqual({ version: 1, salt: expect.any(String), iv: expect.any(String), data: expect.any(String) });
  expect(contents).not.toContain('Office cleaner');
  expect(contents).not.toContain('Maya');
});

test('@claim:offline-reload keeps the demo calendar available after first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  expect(await page.evaluate(async () => {
    const urls = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"]')].map((element) => element instanceof HTMLScriptElement ? element.src : element.href);
    const responses = await Promise.all(urls.map((url) => caches.match(url)));
    return (await Promise.all(responses.map((response) => response?.clone().arrayBuffer().then((body) => body.byteLength) || 0))).every((length) => length > 0);
  })).toBeTruthy();
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Your next 60 days of renewals' })).toBeVisible();
  await context.setOffline(false);
});

test('@claim:private-data sends real subscription data to no other origin', async ({ page }) => {
  const seen: string[] = [];
  page.on('request', (request) => seen.push(request.url()));
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('Private entry');
  await dialog.getByLabel('Amount').fill('10');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  await page.getByRole('button', { name: 'Export CSV' }).click();
  await expect(page.getByRole('button', { name: /connect.*bank/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /connect.*bank/i })).toHaveCount(0);
  expect(seen.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('@claim:device-storage keeps a real subscription in this browser between visits', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('Browser-persisted renewal');
  await dialog.getByLabel('Amount').fill('29');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  await expect(page.locator('.subscription-list').getByRole('heading', { name: 'Browser-persisted renewal' })).toBeVisible();
  await page.reload();
  await expect(page.locator('.subscription-list').getByRole('heading', { name: 'Browser-persisted renewal' })).toBeVisible();
});

test('@claim:pro-price keeps the $19 one-time upgrade optional and opens hosted checkout', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.pro')).toContainText('Pro costs $19 once');
  await expect(page.locator('.pro')).toContainText('Core tracking, CSV, ICS, encrypted backups, and deletion stay free');
  const checkout = 'https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/checkout';
  await expect(page.locator('.pro').getByRole('link', { name: 'Buy Pro for $19' })).toHaveAttribute('href', checkout);
  const checkoutResponse = await request.get(checkout, { maxRedirects: 0 });
  expect(checkoutResponse.status()).toBe(303);
  expect(checkoutResponse.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
  await page.goto('/app');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:subscription-renewal-calendar'))).toBeNull();
  for (const name of ['Add subscription', 'Import CSV', 'Export ICS reminders', 'Export CSV', 'Encrypted backup']) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  }
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill('Free core calendar');
  await dialog.getByLabel('Amount').fill('19');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  await expect(page.getByRole('button', { name: 'Delete all subscriptions' })).toBeVisible();
  await expect(page.locator('.license').getByRole('link', { name: 'Buy Pro for $19' })).toHaveAttribute('href', checkout);
  await page.goto('/terms');
  await expect(page.locator('main')).toContainText('Pro is a $19 one-time license');
});

test('cold loads keep the skip link first and client-side routes focus their heading', async ({ page }) => {
  for (const path of ['/', '/demo', '/app', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
  }

  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { name: 'Your next 60 days of renewals' })).toBeFocused();
});

test('announces an installed app update and offers a reload action', async ({ page }) => {
  await page.goto('/app');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Add subscription' })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'APP_UPDATE_READY' } })));
  const notice = page.getByRole('status').filter({ hasText: 'An app update is ready.' });
  await expect(notice).toBeVisible();
  await expect(notice.getByRole('button', { name: 'Reload now' })).toBeVisible();
});

test('desktop routes have clean semantics, console output, and automated accessibility', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/demo', '/app', '/privacy', '/terms', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Subscription Renewal Calendar|Subscription Renewal Calendar — see renewals/);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('404 page states the error literally and links back to the calendar', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Subscription Renewal Calendar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Go to the renewal calendar' })).toHaveAttribute('href', '/');

  await page.goto('/verification-no-such-route');
  await expect(page).toHaveTitle('Page not found — Subscription Renewal Calendar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Go to the renewal calendar' })).toHaveAttribute('href', '/');
});

test('390px mobile layout has no horizontal overflow and keeps primary controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  for (const name of ['Add subscription', 'Import CSV', 'Export ICS reminders', 'Export CSV', 'Encrypted backup']) {
    const box = await page.getByText(name, { exact: true }).first().boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('a, button, .file-button')].filter((element) => element.getClientRects().length).every((element) => {
    const box = element.getBoundingClientRect(); return box.width >= 44 && box.height >= 44;
  }))).toBeTruthy();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.occurrence')!).transitionDuration)).toBe('0s');
});

test('rejects an unsupported CSV currency without persisting a row or blanking the app', async ({ page }) => {
  await page.goto('/app');
  await page.getByLabel('Import CSV').setInputFiles({ name: 'bad-currency.csv', mimeType: 'text/csv', buffer: Buffer.from('name,amount,currency,frequency,starts_on,owner\nBad currency,10,NOT-A-CURRENCY,monthly,2026-08-28,Rae') });
  await expect(page.locator('.notice')).toContainText('Row 2 has an invalid currency');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your next 60 days of renewals' })).toBeVisible();
  await expect(page.getByText('Bad currency', { exact: true })).toHaveCount(0);
});

test('groups mixed-currency calendar totals instead of adding unlike money', async ({ page }) => {
  await page.goto('/app');
  for (const [name, amount, currency] of [['Dollar plan', '10', 'USD'], ['Euro plan', '20', 'EUR']] as const) {
    await page.getByRole('button', { name: 'Add subscription' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill(name);
    await dialog.getByLabel('Amount').fill(amount);
    await dialog.getByLabel('Currency').selectOption(currency);
    await dialog.getByLabel('Owner').fill('Rae');
    await dialog.getByRole('button', { name: 'Save subscription' }).click();
  }
  const summary = page.getByLabel('Calendar summary');
  await expect(summary).toContainText(/\$20\.00.*USD/);
  await expect(summary).toContainText(/€40\.00.*EUR/);
  await expect(summary).not.toContainText('$60.00');
});

test('requires a valid license verdict before revealing the Pro forecast', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/verify?license=*', (route) => route.fulfill({ json: { valid: false, reason: 'invalid' } }));
  await page.goto('/demo');
  await page.getByLabel('License token').fill('definitely-invalid-qa-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('.notice')).toContainText('This license is not active');
  await expect(page.locator('.forecast')).toContainText('Pro adds a year-ahead total');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:subscription-renewal-calendar'))).toBeNull();
});

test('checkout return verifies once immediately and unlocks the Pro forecast after navigation and reload', async ({ page }) => {
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/verify?license=*', (route) => {
    verificationRequests += 1;
    return route.fulfill({ json: { valid: true, reason: 'ok' } });
  });

  await page.goto('/?license=valid-paid-return-qa');
  await expect.poll(() => verificationRequests).toBe(1);
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:subscription-renewal-calendar'))).toBe('valid-paid-return-qa');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  await page.reload();
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  expect(verificationRequests).toBe(1);
});

test('checkout return keeps the token and an actionable retry after verification cannot finish', async ({ page }) => {
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/verify?license=*', (route) => {
    verificationRequests += 1;
    return verificationRequests === 1
      ? route.fulfill({ status: 503, json: { message: 'temporarily unavailable' } })
      : route.fulfill({ json: { valid: true, reason: 'ok' } });
  });

  await page.goto('/demo?license=recoverable-paid-return-qa');
  await expect(page.locator('.notice')).toContainText('Your license is saved but has not been verified');
  await expect(page.getByLabel('License token')).toHaveValue('recoverable-paid-return-qa');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:subscription-renewal-calendar'))).toBe('recoverable-paid-return-qa');
  expect(await page.evaluate(() => localStorage.getItem('sb_license_verdict:subscription-renewal-calendar'))).toBeNull();
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  expect(verificationRequests).toBe(2);
});

test('@claim:pro-forecast shows a grouped 12-month forecast only after a valid verification', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/verify?license=*', (route) => route.fulfill({ json: { valid: true, reason: 'ok' } }));
  await page.goto('/demo');
  await page.getByLabel('License token').fill('valid-test-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  await expect(page.locator('.forecast')).toContainText('(USD)');
});

test('@claim:verified-license-offline keeps a verified Pro forecast available offline', async ({ page, context }) => {
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/subscription-renewal-calendar/verify?license=*', (route) => {
    verificationRequests += 1;
    return route.fulfill({ json: { valid: true, reason: 'ok' } });
  });
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.getByLabel('License token').fill('valid-offline-test-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  expect(verificationRequests).toBe(1);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.forecast')).toContainText('scheduled across the next year');
  expect(verificationRequests).toBe(1);
  await context.setOffline(false);
});

test('@claim:delete-all removes every subscription from the current workspace', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', (prompt) => prompt.accept());
  await page.getByRole('button', { name: 'Delete all subscriptions' }).click();
  await expect(page.getByRole('heading', { name: 'No subscriptions yet' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No subscriptions yet' })).toBeVisible();
});

test('@claim:cost-history edits a subscription and records its cost increase after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Edit Linear' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit subscription' });
  await dialog.getByLabel('Amount').fill('120');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByLabel('Review days early').fill('3');
  await dialog.getByLabel('Decision').selectOption('cancel');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  const row = page.locator('.subscription-list article').filter({ hasText: 'Linear' });
  await expect(row).toContainText('Owner: Rae · review 3 days early · cancel');
  await expect(row).toContainText('Cost rose from $96.00');
  await page.reload();
  await expect(page.locator('.subscription-list article').filter({ hasText: 'Linear' })).toContainText('Cost rose from $96.00');
});

test('@claim:high-value-warning flags charges above the chosen threshold without seven review days', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Amount', { exact: true }).last().fill('500');
  await page.getByRole('button', { name: 'Save review rule' }).click();
  await page.getByRole('button', { name: 'Add subscription' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a subscription' });
  await dialog.getByLabel('Name').fill('Urgent annual platform');
  await dialog.getByLabel('Amount').fill('600');
  await dialog.getByLabel('Owner').fill('Rae');
  await dialog.getByLabel('Review days early').fill('3');
  await dialog.getByRole('button', { name: 'Save subscription' }).click();
  const warning = page.locator('.threshold-alert');
  await expect(warning).toContainText('High-value charges need more lead time');
  await expect(warning).toContainText('Urgent annual platform is $600.00 with only 3 review days');
});

test('names the dialog, keeps 44px dialog controls, and shows file-input focus on its label', async ({ page }) => {
  await page.goto('/demo');
  const add = page.getByRole('button', { name: 'Add subscription' });
  const input = page.getByLabel('Import CSV');
  const label = page.locator('.file-button');
  await add.focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  await expect(label).toHaveCSS('outline-style', 'solid');
  await expect(label).toHaveCSS('outline-width', '4px');
  await expect(label).toHaveCSS('outline-color', 'rgb(232, 91, 69)');
  const inputBox = await input.boundingBox();
  expect(inputBox?.width).toBeGreaterThanOrEqual(44);
  expect(inputBox?.height).toBeGreaterThanOrEqual(44);
  await add.click();
  const dialog = page.getByRole('dialog', { name: 'Add a subscription' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => [...element.querySelectorAll<HTMLElement>('button,input,select')].every((control) => control.getBoundingClientRect().height >= 44))).toBeTruthy();
  const results = await new AxeBuilder({ page }).include('dialog').analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
