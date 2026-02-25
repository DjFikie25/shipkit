import { test, expect } from '@playwright/test';

test.describe('Authentication pages', () => {
  test.describe('Sign-in page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signin');
    });

    test('renders email and password inputs', async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('renders submit button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('shows validation error for empty submission', async ({ page }) => {
      await page.getByRole('button', { name: /sign in/i }).click();
      // Browser-native or custom validation must surface an error
      const emailInput = page.getByLabel(/email/i);
      const validationMessage = await emailInput.evaluate(
        (el) => (el as HTMLInputElement).validationMessage,
      );
      expect(validationMessage.length).toBeGreaterThan(0);
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.getByLabel(/email/i).fill('nobody@example.com');
      await page.getByLabel(/password/i).fill('wrong-password');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should stay on signin page — either an auth error or a network/server error
      await expect(page).toHaveURL(/signin/, { timeout: 10_000 });
      const error = page
        .getByRole('alert')
        .or(page.locator('[data-testid="auth-error"]'));
      await expect(error).toBeVisible({ timeout: 10_000 });
    });

    test('link to sign-up page is present', async ({ page }) => {
      const link = page.getByRole('link', { name: /sign up|create account/i });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', '/signup');
    });
  });

  test.describe('Sign-up page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signup');
    });

    test('renders name, email, and password fields', async ({ page }) => {
      await expect(page.getByLabel(/name/i).first()).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test('shows error for weak password (< 8 chars)', async ({ page }) => {
      await page.getByLabel(/email/i).fill('newuser@example.com');
      await page.getByLabel(/password/i).first().fill('short');
      await page.getByRole('button', { name: /create account/i }).click();

      // Either native HTML5 validation or a visible error message
      const passwordInput = page.getByLabel(/password/i).first();
      const nativeError = await passwordInput.evaluate(
        (el) => (el as HTMLInputElement).validationMessage,
      );
      if (!nativeError) {
        const customError = page.getByRole('alert');
        await expect(customError).toBeVisible({ timeout: 5_000 });
      }
    });

    test('link back to sign-in is present', async ({ page }) => {
      const link = page.getByRole('link', { name: /sign in|log in/i });
      await expect(link).toBeVisible();
    });
  });

  test.describe('Password reset page', () => {
    test('renders the reset request form', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|reset/i })).toBeVisible();
    });
  });
});
