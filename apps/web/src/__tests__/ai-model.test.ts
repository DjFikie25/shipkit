/**
 * Unit tests for the AI model factory.
 *
 * We only test `getMastraModel()` — the pure string function — because it is
 * the easiest to verify without mocking the entire AI SDK.  `getModel()` and
 * `getFastModel()` return real SDK language-model objects; we just verify they
 * return something truthy (no throw, no network call at construction time).
 *
 * IMPORTANT: `PROVIDER` and `MODEL_NAME` are module-level constants in
 * ai-model.ts, so we must call `vi.resetModules()` before each test and
 * dynamically re-import the module AFTER setting the env vars.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ai-model factory', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore env to original state so tests don't bleed into each other
    process.env['AI_PROVIDER'] = originalEnv['AI_PROVIDER'];
    process.env['AI_MODEL'] = originalEnv['AI_MODEL'];
  });

  describe('getMastraModel()', () => {
    it('defaults to groq provider when AI_PROVIDER is not set', async () => {
      delete process.env['AI_PROVIDER'];
      delete process.env['AI_MODEL'];
      const { getMastraModel } = await import('@/lib/ai-model');

      expect(getMastraModel()).toBe('groq/llama-3.3-70b-versatile');
    });

    it('uses the provider from AI_PROVIDER env var', async () => {
      process.env['AI_PROVIDER'] = 'openai';
      process.env['AI_MODEL'] = 'gpt-4o';
      const { getMastraModel } = await import('@/lib/ai-model');

      expect(getMastraModel()).toBe('openai/gpt-4o');
    });

    it('uses the default model for the provider when AI_MODEL is not set', async () => {
      process.env['AI_PROVIDER'] = 'anthropic';
      delete process.env['AI_MODEL'];
      const { getMastraModel } = await import('@/lib/ai-model');

      expect(getMastraModel()).toBe('anthropic/claude-sonnet-4-5');
    });

    it('returns provider/model string with google provider', async () => {
      process.env['AI_PROVIDER'] = 'google';
      process.env['AI_MODEL'] = 'gemini-2.0-flash';
      const { getMastraModel } = await import('@/lib/ai-model');

      expect(getMastraModel()).toBe('google/gemini-2.0-flash');
    });

    it('formats string as <provider>/<model>', async () => {
      process.env['AI_PROVIDER'] = 'groq';
      process.env['AI_MODEL'] = 'llama-3.1-8b-instant';
      const { getMastraModel } = await import('@/lib/ai-model');

      const result = getMastraModel();
      expect(result).toMatch(/^[a-z]+\/.+$/);
    });
  });

  describe('getModel() / getFastModel()', () => {
    it('returns a truthy model object without throwing (groq)', async () => {
      process.env['AI_PROVIDER'] = 'groq';
      process.env['GROQ_API_KEY'] = 'test-key';
      const { getModel, getFastModel } = await import('@/lib/ai-model');

      expect(getModel()).toBeTruthy();
      expect(getFastModel()).toBeTruthy();
    });

    it('returns a truthy model object without throwing (openai)', async () => {
      process.env['AI_PROVIDER'] = 'openai';
      process.env['OPENAI_API_KEY'] = 'test-key';
      const { getModel } = await import('@/lib/ai-model');

      expect(getModel()).toBeTruthy();
    });
  });
});
