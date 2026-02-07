import {describe, it, expect, vi} from 'vitest';
import memoize from '../../../src/utils/memoize-decorator';

describe('memoize', () => {
  it('memoizes standalone functions', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);
    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('memoizes class methods with instance hash', () => {
    const original = vi.fn(function(this: Test, b: number) {
      return this.a + b;
    });
    class Test {
      constructor(public a: number) {}
      /**
       * Unique identifier for memoization.
       * @returns ID string for this instance.
       */
      __hash__(): string {
        return `id-${this.a}`;
      }
      add = memoize(original);
    }
    const t = new Test(2);
    expect(t.add(3)).toBe(5);
    expect(t.add(3)).toBe(5);
    expect(original).toHaveBeenCalledTimes(1);
  });
});
