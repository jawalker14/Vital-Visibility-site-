import { test, expect } from '@playwright/test';

test('contact form client validation', async ({ page }) => {
  await page.goto('/contact.html'); // Use explicit path
  
  // Wait for the form to be ready
  await page.waitForLoadState('networkidle');
  
  // Ensure the form is present
  await expect(page.locator('#contact-form')).toBeVisible();
  
  // First validation check - submit empty form
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#form-status')).toContainText('Please complete', { timeout: 10000 });

  // Second validation check - submit with invalid data
  await page.fill('#name', 'J');
  await page.fill('#email', 'not-an-email');
  await page.fill('#message', 'short');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#form-status')).toContainText('Please complete', { timeout: 10000 });
});
