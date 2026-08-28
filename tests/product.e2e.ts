import { expect, test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-isolated opens a separate sample workspace', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo mode')).toContainText('sample data, nothing is saved');
  await expect(page.getByText('Office cleaner', { exact: true }).first()).toBeVisible();
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

test('@claim:private-data sends no demo data to another origin', async ({ page }) => {
  const seen: string[] = [];
  page.on('request', (request) => seen.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect(seen.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('announces an installed app update and offers a reload action', async ({ page }) => {
  await page.goto('/app');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
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
