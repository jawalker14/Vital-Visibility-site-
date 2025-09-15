import { test, expect } from '@playwright/test';

test('contact form client validation', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#form-status')).toContainText('Please complete');

  await page.fill('#name', 'J');
  await page.fill('#email', 'not-an-email');
  await page.fill('#message', 'short');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#form-status')).toContainText('Please complete');
});
