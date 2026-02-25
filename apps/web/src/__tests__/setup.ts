// Global test setup — runs before every test file.
// Stub Next.js server-only modules that can't run in Vitest's node environment.
import { vi } from 'vitest';

// next/headers is server-only; stub it so lib/auth.ts doesn't crash during import
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));
