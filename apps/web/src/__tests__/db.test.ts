/**
 * Unit tests for the Neon DB pool configuration helper.
 *
 * Key constraints:
 * - `new Pool()` is only called inside `getPool()`, not at module import time.
 * - `getPool()` stores its result in `global.__pgPool` (singleton).
 * - We use `vi.hoisted()` so that the mock reference is stable across the
 *   module import boundary (hoisted mocks run before the module is evaluated).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mock constructor so it's created before `vi.mock('pg', ...)` runs.
// Must use a regular `function` (not arrow) so it can be called with `new`.
const { MockPool } = vi.hoisted(() => {
  // Must be a regular function (not arrow) so it can be used with `new`
  const MockPool = vi.fn(function MockPoolCtor() {
    return { query: vi.fn() };
  });
  return { MockPool };
});

vi.mock('pg', () => ({ Pool: MockPool }));

// Import after vi.mock so the module gets the mocked pg
import { getPool } from '@/lib/db';

describe('getPool()', () => {
  beforeEach(() => {
    MockPool.mockClear();
    // Clear the global singleton so each test gets a fresh Pool
    globalThis.__pgPool = undefined;
  });

  it('throws when DATABASE_URL is not set', () => {
    const saved = process.env['DATABASE_URL'];
    process.env['DATABASE_URL'] = '';
    expect(() => getPool()).toThrow('DATABASE_URL');
    process.env['DATABASE_URL'] = saved;
  });

  it('creates a Pool with the DATABASE_URL when not yet initialised', () => {
    process.env['DATABASE_URL'] = 'postgresql://user:pass@ep-xxx.neon.tech/db';
    getPool();
    expect(MockPool).toHaveBeenCalledOnce();
  });

  it('returns the same singleton on repeated calls', () => {
    process.env['DATABASE_URL'] = 'postgresql://user:pass@ep-xxx.neon.tech/db';
    const a = getPool();
    const b = getPool();
    expect(a).toBe(b);
    expect(MockPool).toHaveBeenCalledOnce();
  });

  it('strips sslmode from the DATABASE_URL before passing to Pool', () => {
    process.env['DATABASE_URL'] =
      'postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require';
    getPool();

    const callArg = (MockPool.mock.calls as unknown[][])[0]?.[0] as {
      connectionString: string;
      ssl: { rejectUnauthorized: boolean };
    };
    expect(callArg?.connectionString).not.toContain('sslmode');
    expect(callArg?.ssl.rejectUnauthorized).toBe(false);
  });

  it('strips channel_binding from the DATABASE_URL before passing to Pool', () => {
    process.env['DATABASE_URL'] =
      'postgresql://user:pass@ep-xxx.neon.tech/db?channel_binding=require&sslmode=verify-full';
    getPool();

    const callArg = (MockPool.mock.calls as unknown[][])[0]?.[0] as { connectionString: string };
    expect(callArg?.connectionString).not.toContain('channel_binding');
    expect(callArg?.connectionString).not.toContain('sslmode');
  });
});
