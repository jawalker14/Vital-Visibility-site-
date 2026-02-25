import { test, expect } from '@playwright/test';

const pages = [
  '/index.html',
  '/services.html',
  '/pricing.html',
  '/privacy.html',
  '/terms.html',
  '/contact.html'
];

for (const p of pages) {
  test(`active nav correct on ${p}`, async ({ page }) => {
    await page.goto(p);
    // Active nav exactly one item
    const current = page.locator('#site-nav a[aria-current="page"]');
    await expect(current).toHaveCount(1);
  });
}
