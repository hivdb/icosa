import memoizeFn from 'fast-memoize';

/**
 * Memoize decorator for functions or class methods.
 *
 * @param method - Function to be memoized.
 * @returns A memoized wrapper around {@link method}.
 */
export default function memoize<
  T extends (...args: any[]) => any
>(method: T): (...args: Parameters<T>) => ReturnType<T> {
  const cachedMethod = memoizeFn(
    (self: unknown, args: Parameters<T>) => method.apply(self, args),
    {
      serializer: ([self, args]: [any, Parameters<T>]) => {
        if (self === undefined) {
          return 'undefined';
        }
        return JSON.stringify([self.__hash__(), args]);
      }
    }
  );
  return function memoized(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    return cachedMethod(this, args);
  };
}
