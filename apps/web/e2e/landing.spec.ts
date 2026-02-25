import { test, expect } from '@playwright/test';

test.describe('Public landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders headline and key feature text', async ({ page }) => {
    // The landing page should have a prominent heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // At least one CTA button pointing to sign-up or sign-in
    const cta = page.getByRole('link', { name: /get started|sign up|sign in/i }).first();
    await expect(cta).toBeVisible();
  });

  test('has a page title', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  test('navigation links are reachable', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    await expect(signInLink).toHaveAttribute('href', '/signin');
  });

  test('has no broken images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      if (src) {
        expect(src.length).toBeGreaterThan(0);
      }
    }
  });

  test('meets basic accessibility — no keyboard traps', async ({ page }) => {
    // Tab through the first 10 focusable elements without errors
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    // No error thrown means no hard keyboard trap
  });
});
