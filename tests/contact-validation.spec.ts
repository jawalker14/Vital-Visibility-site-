import { test, expect } from '@playwright/test';

test.describe('Contact Form Enhanced Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.locator('#form-status')).toContainText('Please complete all required fields correctly');
  });

  test('should validate name field with real-time feedback', async ({ page }) => {
    const nameField = page.locator('#name');
    
    // Enter invalid short name
    await nameField.fill('J');
    await nameField.blur();
    
    // Should show error message
    await expect(page.locator('.field-error-message')).toContainText('Name must be at least 2 characters long');
    
    // Fix the name
    await nameField.fill('John Doe');
    
    // Error should disappear
    await expect(page.locator('.field-error-message')).toHaveCount(0);
  });

  test('should validate email field with improved validation', async ({ page }) => {
    const emailField = page.locator('#email');
    
    // Test invalid email formats
    const invalidEmails = ['not-an-email', 'test@', '@domain.com', 'test@domain'];
    
    for (const invalidEmail of invalidEmails) {
      await emailField.fill(invalidEmail);
      await emailField.blur();
      
      await expect(page.locator('.field-error-message')).toContainText('Please enter a valid email address');
      
      // Clear for next test
      await emailField.fill('');
    }
    
    // Test valid email
    await emailField.fill('john.doe@example.com');
    await emailField.blur();
    
    // Should not show error
    await expect(page.locator('.field-error-message')).toHaveCount(0);
  });

  test('should validate phone field when provided (optional)', async ({ page }) => {
    const phoneField = page.locator('#phone');
    
    // Test invalid phone formats
    await phoneField.fill('abc');
    await phoneField.blur();
    
    await expect(page.locator('.field-error-message')).toContainText('Please enter a valid phone number');
    
    // Test valid phone
    await phoneField.fill('+27810958672');
    await phoneField.blur();
    
    // Should not show error
    await expect(page.locator('.field-error-message')).toHaveCount(0);
  });

  test('should validate message field for minimum length', async ({ page }) => {
    const messageField = page.locator('#message');
    
    // Enter short message
    await messageField.fill('short');
    await messageField.blur();
    
    await expect(page.locator('.field-error-message')).toContainText('Message must be at least 10 characters long');
    
    // Fix the message
    await messageField.fill('This is a valid message with enough characters');
    
    // Error should disappear
    await expect(page.locator('.field-error-message')).toHaveCount(0);
  });

  test('should validate consent checkbox', async ({ page }) => {
    // Fill all other fields correctly
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john.doe@example.com');
    await page.fill('#message', 'This is a test message with enough content');
    
    // Try to submit without consent
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    await expect(page.locator('#form-status')).toContainText('Please complete all required fields correctly');
  });

  test('should submit form when all validations pass', async ({ page }) => {
    // Fill all fields correctly
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john.doe@example.com');
    await page.fill('#phone', '+27810958672');
    await page.fill('#message', 'This is a comprehensive test message with enough content to pass validation');
    await page.check('#consent');
    
    // Submit form
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // Should show sending status
    await expect(page.locator('#form-status')).toContainText('Sending…');
  });
});