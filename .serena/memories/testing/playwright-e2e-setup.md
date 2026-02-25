# Playwright E2E Testing

## Config: `apps/web/playwright.config.ts`
- Test dir: `apps/web/e2e/`
- Browsers: Chromium, Firefox, Mobile Chrome (Pixel 5).
- `webServer` block auto-starts `pnpm dev` when running locally (re-uses existing server if already running).
- In CI: `reuseExistingServer: false`, retries 2, workers 1.
- Base URL via `PLAYWRIGHT_BASE_URL` env var (defaults to `http://localhost:3000`).
- Screenshots on failure, trace on first retry.

## Run commands
```bash
pnpm test:e2e                          # from root (uses turbo --filter=@template/web)
pnpm --filter=@template/web test:e2e   # directly
pnpm --filter=@template/web test:e2e:ui  # Playwright interactive UI
```

## Install browsers (first time)
```bash
pnpm --filter=@template/web exec playwright install
# In CI: playwright install --with-deps chromium
```

## Test files and coverage
| File | What is tested |
|---|---|
| `e2e/landing.spec.ts` | H1 heading, CTA link to /signup or /signin, page title, images, keyboard nav |
| `e2e/auth.spec.ts` | Sign-in/sign-up form fields, validation, invalid-credential error, cross-page links |
| `e2e/auth-guards.spec.ts` | /dashboard → redirect to /signin, /chat → redirect to /signin, public routes return < 400 |

## Auth guard test pattern
```ts
test('unauthenticated visitor is redirected from /dashboard to /signin', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/signin/, { timeout: 8_000 });
});
```

## CI integration (GitHub Actions)
See `.github/workflows/ci.yml`. Pipeline order:
1. Lint & type-check
2. Unit tests (Vitest, with coverage)
3. Build web (`pnpm build:web`) with stub env vars
4. E2E (Playwright, Chromium only in CI)

Playwright report uploaded as artifact (`playwright-report/`) retained 14 days.
Next.js build is cached between the build and E2E jobs via `actions/cache`.

## Writing new E2E tests
- Use `page.getByRole()` and `page.getByLabel()` — prefer accessible selectors over CSS.
- Use `data-testid` attributes on custom error elements (`[data-testid="auth-error"]`) so E2E tests can reliably find them.
- For flaky async content, prefer `toBeVisible({ timeout: 5_000 })` over fixed waits.
- The `webServer` block in `playwright.config.ts` handles server startup — no need to start manually.
