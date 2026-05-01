import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts — last class wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('bg-black', 'bg-white')).toBe('bg-white');
  });

  it('drops falsy conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    expect(cn('foo', 0 && 'bar')).toBe('foo');
  });

  it('includes truthy conditional classes', () => {
    expect(cn('foo', true && 'bar')).toBe('foo bar');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('handles array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles empty input gracefully', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('merges conflicting Tailwind padding + margin', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
    expect(cn('m-2', 'mx-4')).toBe('m-2 mx-4');
  });

  it('handles mixed syntax (objects, arrays, strings)', () => {
    expect(cn('base', { active: true, hidden: false }, ['extra'])).toBe('base active extra');
  });
});
