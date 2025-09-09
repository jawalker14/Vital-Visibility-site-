import { test, expect } from '@playwright/test';

test('nav links resolve without 404', async ({ page }) => {
  await page.goto('/');
  const links = [
    '/index.html',
    '/services/index.html',
    '/pricing.html',
    '/about.html',
    '/contact.html'
  ];
  for (const href of links) {
    const res = await page.goto(href);
    expect(res?.status()).toBeLessThan(400);
  }
});

test('404 page shows helpful link', async ({ page }) => {
  const res = await page.goto('/not-a-real-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
});

