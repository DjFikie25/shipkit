import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn()', () => {
  it('returns empty string with no args', () => {
    expect(cn()).toBe('');
  });

  it('joins simple strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('flattens nested arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handles deeply nested arrays', () => {
    expect(cn([['deep', 'nested'], 'flat'])).toBe('deep nested flat');
  });

  it('joins multiple strings with single space separators', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('works with conditional expressions', () => {
    const active = true;
    const disabled = false;
    expect(cn('btn', active && 'btn-active', disabled && 'btn-disabled')).toBe('btn btn-active');
  });
});
