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
  test(`skip link visible and active nav correct on ${p}`, async ({ page }) => {
    await page.goto(p);
    await expect(page.locator('a.skip-link')).toBeVisible();
    // Active nav exactly one item
    const current = page.locator('#site-nav a[aria-current="page"]');
    await expect(current).toHaveCount(1);
  });
}
