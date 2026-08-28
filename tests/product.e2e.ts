import { expect, test } from 'playwright/test';

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

test('@claim:offline-reload keeps the demo calendar available after first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
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
