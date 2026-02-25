# Vitest Testing Patterns & Pitfalls

## Monorepo Setup
- Each package (`packages/ui`, `packages/api-client`, `apps/web`) has its own `vitest.config.ts`.
- Vitest is listed in `devDependencies` of each package individually — it is NOT hoisted to the root.
- Run all tests from root: `pnpm test` (Turborepo fans out to each package's `test` script).
- Run a single package: `pnpm --filter=@template/web test`.
- Watch mode: `pnpm --filter=@template/ui test:watch`.

## Critical: Module-level constants and vi.resetModules()
When a module reads `process.env` at the **top level** (not inside a function), the value is baked in at import time.
To test different env values, you MUST:
1. Call `vi.resetModules()` in `beforeEach` to clear the module cache.
2. Set the env var BEFORE the dynamic `await import(...)` inside the test body.
3. Use `delete process.env['VAR']` (not `= ''`) to truly unset — `??` fallback only triggers on `null`/`undefined`, not empty string.

```ts
beforeEach(() => { vi.resetModules(); });

it('uses groq by default', async () => {
  delete process.env['AI_PROVIDER'];
  const { getMastraModel } = await import('@/lib/ai-model');
  expect(getMastraModel()).toBe('groq/llama-3.3-70b-versatile');
});
```

## Critical: vi.fn() as a Constructor (new X())
`vi.fn(() => ...)` with an **arrow function** CANNOT be used with `new` — arrow functions have no `[[Construct]]` slot.
Use a named regular function:
```ts
const MockPool = vi.fn(function MockPoolCtor() {
  return { query: vi.fn() };
});
```

## Critical: vi.hoisted() for stable mock references
When a mock factory variable must be referenced both inside `vi.mock(...)` AND in test assertions, use `vi.hoisted()`:
```ts
const { MockPool } = vi.hoisted(() => {
  const MockPool = vi.fn(function MockPoolCtor() {
    return { query: vi.fn() };
  });
  return { MockPool };
});

vi.mock('pg', () => ({ Pool: MockPool }));
```
Without `vi.hoisted()`, the variable is `undefined` inside the `vi.mock` factory because `vi.mock` calls are hoisted above variable declarations.

## Critical: Singleton modules and global state
Modules that store state in `global` (e.g., `global.__pgPool`) are NOT reset by `vi.resetModules()`.
You must manually clear global state in `beforeEach`:
```ts
beforeEach(() => {
  MockPool.mockClear();
  globalThis.__pgPool = undefined; // clear the singleton
});
```

## Critical: Import vs Call
If a module only instantiates objects INSIDE exported functions (not at top level), merely `await import('...')` does NOT call those functions. You must explicitly call the exported function in the test to trigger the mock:
```ts
const { getPool } = await import('@/lib/db');
getPool(); // must call this to trigger new Pool()
expect(MockPool).toHaveBeenCalledOnce();
```

## Mocking Next.js server-only modules
`next/headers` cannot run outside the Next.js runtime. Stub it in `src/__tests__/setup.ts`:
```ts
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));
```
Reference this file in `vitest.config.ts` via `setupFiles: ['./src/__tests__/setup.ts']`.

## Don't over-mock AI SDK providers
The AI SDK (`@ai-sdk/groq`, etc.) does NOT make network calls when constructing a model object — only when running inference. So `getModel()` can be tested without any mocking; just verify the return value is truthy. The internal `.provider` property is `'groq.chat'` / `'openai.chat'` / `'anthropic.messages'` / `'google.generative-ai'` — NOT bare provider names.
