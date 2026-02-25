import { test, expect } from '@playwright/test';

/**
 * Tests that protected routes redirect unauthenticated visitors
 * and that public routes are accessible without a session.
 */
test.describe('Route auth guards', () => {
  test('unauthenticated visitor is redirected from /dashboard to /signin', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/signin/, { timeout: 8_000 });
  });

  test('unauthenticated visitor is redirected from /chat to /signin', async ({ page }) => {
    await page.goto('/chat');
    await expect(page).toHaveURL(/signin/, { timeout: 8_000 });
  });

  test('public routes are reachable without a session', async ({ page }) => {
    for (const route of ['/', '/signin', '/signup', '/reset-password']) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });
});
