# AGENTS.md — AI Coding Guidelines

This file is the canonical source of truth for all AI coding agents (Cursor, Claude, etc.) working in this repo.
Read it in full before modifying any file.

---

## 1. Project Architecture

```
my-app-template/
├── apps/web/         # Next.js 15 (App Router) — main web application
├── apps/mobile/      # Expo SDK 54 + React Native — mobile companion app
├── packages/ui/      # Shared pure TypeScript utilities (no platform deps)
└── packages/api-client/  # Typed fetch wrapper for mobile → web API calls
```

**Tech stack:**
- **Auth:** Better Auth (server, `apps/web/src/lib/auth.ts`) + `@better-auth/expo` client for mobile
- **Database:** Neon PostgreSQL via `pg` pool; Drizzle ORM for app tables; raw SQL for complex queries
- **AI:** Mastra agents (`apps/web/src/mastra/`) with multi-provider LLM support; AI SDK for streaming
- **Styling (web):** Tailwind CSS v4 via `@tailwindcss/postcss`
- **Styling (mobile):** NativeWind v4 (Tailwind syntax in React Native)
- **Monorepo:** pnpm workspaces + Turborepo

---

## 2. Auth Conventions

- **Server-side auth:** Always call `getServerUser()` from `@/lib/auth` in Server Components and Route Handlers. Never read cookies manually.
- **Client-side auth:** Use `authClient` from `@/lib/auth-client` (web) or `@/lib/auth-client` (mobile).
- **Unauthenticated redirect:** `redirect('/signin?next=<current-path>')` in Server Components.
- **Never** expose `BETTER_AUTH_SECRET` or `DATABASE_URL` to the client.

---

## 3. Database Conventions

- App-specific tables live in `apps/web/src/lib/db/schema.ts`.
- Better Auth tables are managed by Better Auth; never add them to the Drizzle schema.
- Use `dbQuery<T>()` for SELECTs, `dbRun()` for INSERTs/UPDATEs/DELETEs, `dbQueryOne<T>()` for single-row.
- Always parameterise queries — never concatenate user input into SQL strings.

---

## 4. AI / Mastra Conventions

- Agents live in `apps/web/src/mastra/agents/`.
- Add new agents to the `Mastra` instance in `apps/web/src/mastra/index.ts`.
- Use `getMastraModel()` from `@/lib/ai-model` so the active provider is env-driven.
- Stream responses via `agent.stream()` and pipe with `createUIMessageStreamResponse`.

---

## 5. React & Next.js Best Practices (Vercel)

### 5.1 Eliminating Waterfalls (CRITICAL)
- **async-parallel:** Use `Promise.all()` for independent async operations — never sequential `await` for unrelated data.
- **async-suspense-boundaries:** Wrap slow Server Components in `<Suspense>` with a skeleton fallback to stream content.
- **async-api-routes:** Start promises early in API route handlers, `await` late.

### 5.2 Bundle Size (CRITICAL)
- **bundle-barrel-imports:** Import directly (`import { thing } from 'lib/thing'`), never from barrel `index.ts` files.
- **bundle-dynamic-imports:** Use `next/dynamic` for components >50 KB (charts, editors, heavy UI).
- **bundle-defer-third-party:** Load analytics/tracking scripts after hydration via `next/script strategy="afterInteractive"`.

### 5.3 Server-Side Performance (HIGH)
- **server-auth-actions:** Always authenticate in Server Actions just like API Route Handlers — call `getServerUser()`.
- **server-cache-react:** Use `React.cache()` for per-request data deduplication in Server Components.
- **server-parallel-fetching:** Restructure components to fetch independently; avoid prop drilling fetched data.

### 5.4 Re-render Optimization (MEDIUM)
- **rerender-memo:** Extract expensive child renders into `React.memo()` components.
- **rerender-derived-state-no-effect:** Derive state during render with `useMemo`, not `useEffect + setState`.
- **rerender-functional-setstate:** Use `setState(prev => ...)` for stable callback refs.
- **rerender-use-ref-transient-values:** Store frequently-updating values (scroll position, mouse coords) in `useRef`, not `useState`.

### 5.5 Rendering (MEDIUM)
- **rendering-conditional-render:** Use ternary (`condition ? <A/> : <B/>`) not `&&` for conditional JSX (avoids rendering `0`).
- **rendering-content-visibility:** Apply `content-visibility: auto` to long lists via CSS.

---

## 6. React Composition Patterns (Vercel)

- **architecture-avoid-boolean-props:** Never add boolean props to customise behaviour. Create explicit variant components instead.
  ```tsx
  // Bad
  <Button primary />
  // Good
  <PrimaryButton /> or <Button variant="primary" />
  ```
- **architecture-compound-components:** Use compound components with shared context for complex UI (e.g. `<Select><Select.Option/></Select>`).
- **state-decouple-implementation:** The Provider is the only component that knows *how* state is managed. Consumers only see the interface.
- **patterns-children-over-render-props:** Prefer `children` for composition over `renderX` callback props.
- **react19-no-forwardref:** Don't use `forwardRef`. Pass `ref` as a plain prop (React 19+).

---

## 7. Logging Best Practices — Wide Events

Every API route handler **must** emit exactly one structured log event per request.

```typescript
// Pattern: initialise event at top, enrich throughout, emit in finally
export async function POST(req: Request) {
  const startTime = Date.now();
  const event: Record<string, unknown> = {
    route: 'POST /api/example',
    timestamp: new Date().toISOString(),
  };
  try {
    const user = await getServerUser();
    event.user_id = user?.id;
    // ... business logic, enriching event ...
    event.outcome = 'success';
    return Response.json(result);
  } catch (err) {
    event.outcome = 'error';
    event.error = { type: err instanceof Error ? err.name : 'Unknown', message: String(err) };
    return Response.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    event.duration_ms = Date.now() - startTime;
    console.log(JSON.stringify(event));   // structured log — swap for your logger
  }
}
```

**Rules:**
1. One wide event per request — not scattered `console.log` lines.
2. Always structured JSON, never string interpolation.
3. Include `user_id`, `route`, `status_code`, `duration_ms`, `outcome`.
4. Wrap all external I/O (DB, AI, email) with timing: `const t0 = Date.now(); ... event.db_ms = Date.now() - t0`.
5. On errors, include `error.type`, `error.message`, `error.code`.

---

## 8. Web Interface Design Guidelines

- **Accessibility first:** All interactive elements must have accessible names, ARIA roles, and keyboard focus management.
- **Colour contrast:** Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- **Focus rings:** Never remove focus outlines. Use `focus-visible:ring` classes.
- **Motion:** Respect `prefers-reduced-motion` — wrap animations in `@media (prefers-reduced-motion: no-preference)`.
- **Loading states:** Show skeletons/spinners, never blank screens.
- **Error states:** Inline, near the field that caused the error — not a modal.
- **Mobile first:** Design for 375px viewport, then scale up.

---

## 9. React Native / Expo Best Practices (Vercel)

### 9.1 List Performance (CRITICAL)
- Use `FlashList` (from `@shopify/flash-list`) for lists >20 items instead of `FlatList`.
- Memoize list item components with `React.memo`.
- Stabilise `renderItem` with `useCallback`.
- Never create inline style objects: `style={{ color: 'red' }}` — use `StyleSheet.create` or NativeWind classes.
- Extract functions outside render to avoid recreation.

### 9.2 Animation (HIGH)
- Only animate `transform` and `opacity` properties — never `width`, `height`, `top`, `left`.
- Use `useDerivedValue` for computed animation values.
- Use `Gesture.Tap` (Gesture Handler) instead of `Pressable` for complex gestures.

### 9.3 Navigation (HIGH)
- Use Expo Router (file-based) — this is already configured.
- Use `<Stack>` with `native` animation and `<Tabs>` with `native` tab bar.
- Never use JS-only navigators in production.

### 9.4 UI Patterns (HIGH)
- Use `expo-image` (`<Image>`) instead of `react-native` `<Image>`.
- Use `<Pressable>` over `<TouchableOpacity>`.
- Always handle safe areas: use `<SafeAreaView>` from `react-native-safe-area-context`, not the core one.
- Use `StyleSheet.create` or NativeWind classes — never inline style objects in lists.

### 9.5 Monorepo (MEDIUM)
- Native dependencies (e.g., `react-native-*`) must live in `apps/mobile/package.json` — NOT in shared packages.
- Keep a single version of React and React Native across the monorepo.

---

## 10. Security Checklist

- [ ] Never `console.log` secrets, tokens, or full user objects.
- [ ] Validate all API request bodies with `zod` before processing.
- [ ] Use parameterised SQL — never string concatenation with user input.
- [ ] Set `BETTER_AUTH_SECRET` to a random 32-byte value (not a guessable string).
- [ ] Keep `DATABASE_URL` server-only — never expose via `NEXT_PUBLIC_*`.
- [ ] Rate-limit sensitive endpoints (auth, AI chat) in production.
- [ ] Implement CSRF protection (Better Auth handles this for browser clients).
- [ ] Set `Content-Security-Policy` and other security headers in `next.config.ts`.

---

## 11. File & Code Conventions

- **Imports:** Always absolute (`@/lib/auth`) not relative (`../../lib/auth`) in `apps/web`.
- **Components:** PascalCase filenames; one component per file.
- **API routes:** Slim handlers — business logic goes in `lib/` or `mastra/`.
- **Types:** Co-locate types with their consumers; share via `packages/api-client/src/types.ts`.
- **No barrel files:** Export directly from the source file.
- **Comments:** Only explain non-obvious intent or trade-offs. Never narrate code.

---

## 12. Testing Conventions

### 12.1 Setup
- **Unit tests (Vitest 4):** each package runs its own `vitest.config.ts`. Run all via `pnpm test` from root.
- **E2E tests (Playwright 1.58):** live in `apps/web/e2e/`. Run via `pnpm test:e2e`. The `webServer` block in `playwright.config.ts` auto-starts Next.js.
- Install Playwright browsers once: `pnpm --filter=@template/web exec playwright install`.

### 12.2 Vitest — Critical Pitfalls

**Module-level constants and env vars**

`ai-model.ts` reads `process.env['AI_PROVIDER']` at the top level (baked in at import time). To test different providers you MUST call `vi.resetModules()` in `beforeEach` and `await import(...)` the module INSIDE each test AFTER setting env vars:

```ts
beforeEach(() => { vi.resetModules(); });

it('uses openai', async () => {
  process.env['AI_PROVIDER'] = 'openai';
  const { getMastraModel } = await import('@/lib/ai-model');
  expect(getMastraModel()).toBe('openai/gpt-4o');
});
```

> **`delete` vs `= ''`:** Use `delete process.env['VAR']` to unset. The `??` operator only falls back on `null`/`undefined` — empty string `''` is NOT falsy for `??`.

**`vi.fn()` as a constructor**

Arrow functions cannot be used with `new`. When mocking a class like `pg.Pool`, use a regular function:

```ts
const MockPool = vi.fn(function MockPoolCtor() {
  return { query: vi.fn() };
});
```

**`vi.hoisted()` for stable mock references**

When you need to reference a mock both inside `vi.mock(...)` AND in assertions, use `vi.hoisted()`. Without it, variables declared above `vi.mock` are `undefined` inside the factory (hoisting):

```ts
const { MockPool } = vi.hoisted(() => {
  const MockPool = vi.fn(function MockPoolCtor() { return { query: vi.fn() }; });
  return { MockPool };
});
vi.mock('pg', () => ({ Pool: MockPool }));
```

**Global singletons (`global.__pgPool`)**

`db.ts` stores the Pool in `global.__pgPool`. `vi.resetModules()` does NOT clear global state. Clear it manually:

```ts
beforeEach(() => {
  MockPool.mockClear();
  globalThis.__pgPool = undefined;
});
```

**Import vs call**

`getPool()` only calls `new Pool()` when invoked — not at module import time. Always call the exported function explicitly in the test; merely `await import('@/lib/db')` is not enough.

**next/headers stub**

Stub server-only Next.js modules in `src/__tests__/setup.ts` (referenced by `vitest.config.ts`):

```ts
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));
```

**Don't mock AI SDK provider internals**

AI SDK model objects have internal provider strings like `'openai.chat'`, `'anthropic.messages'` — NOT bare `'openai'`. Don't assert on them. The SDK does NOT make network calls at model construction time, so `getModel()` can be tested simply with `expect(getModel()).toBeTruthy()`.

### 12.3 Playwright — Key Patterns

```ts
// Prefer role/label selectors over CSS
page.getByRole('button', { name: /sign in/i })
page.getByLabel(/email/i)

// Auth-guard redirects
await page.goto('/dashboard');
await expect(page).toHaveURL(/signin/, { timeout: 8_000 });

// Async error messages
await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 });
```

Add `data-testid="auth-error"` to custom error elements so E2E tests can find them reliably.

### 12.4 CI Pipeline (`.github/workflows/ci.yml`)

Stages run in order: **Lint & type-check → Unit tests → Build web → E2E (Playwright)**. The Next.js build is cached between the build and E2E jobs using `actions/cache`.

---

## 13. Architectural Invariants — Do Not Break

These are hard constraints discovered during development. Violating them causes silent failures.

| Constraint | Why |
|---|---|
| `postcss.config.mjs` must exist in `apps/web/` | Tailwind v4 does NOT process CSS without it — no build error, just unstyled HTML |
| `pnpm install` before any `pnpm dev` or `pnpm test` | `turbo` is a local devDependency, not global — `sh: turbo: command not found` if skipped |
| `delete process.env['X']` not `= ''` to unset env vars in tests | `??` only falls back on `null`/`undefined` |
| `vi.fn()` impl must be a `function`, not an arrow `() =>`, when used with `new` | Arrow functions have no `[[Construct]]` — throws `is not a constructor` |
| `global.__pgPool` must be cleared between tests | Singleton survives `vi.resetModules()` — tests bleed into each other |
| Never use `= ''` for empty string — always `??` defaults require `undefined`/`null` | Silent wrong-provider behaviour in ai-model factory |
| Neon connection strings: always strip `sslmode` and `channel_binding` | `pg` cannot parse those params; Neon pooler requires `ssl: { rejectUnauthorized: false }` |
| `@mastra/core`/`@mastra/pg` versions change frequently | Verify with `npm view @mastra/core version` before adding to a project |
| Google OAuth and Resend are **optional** | Conditional spread pattern in `auth.ts`; dynamic `import('resend')` inside the send function |

---

## 15. Skill References (full rule sets)

The following skills are installed in the workspace and contain the complete rule sets with code examples. Reference them for deeper guidance:

- React & Next.js: `/Users/rchitamoor/.cursor/skills/vercel-react-best-practices/`
- React Native / Expo: `/Users/rchitamoor/.cursor/skills/vercel-react-native-skills/`
- Composition Patterns: `/Users/rchitamoor/.cursor/skills/vercel-composition-patterns/`
- Logging: `/Users/rchitamoor/.cursor/skills/logging-best-practices/`
- Web Design: `/Users/rchitamoor/.cursor/skills/web-design-guidelines/`
