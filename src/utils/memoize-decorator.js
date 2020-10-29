import _memoize from 'fast-memoize';


/**
 * This decorator allows usage like this:
 *
 * @memoize
 * function add(a, b) {
 *   return a + b;
 * }
 *
 * For a prototype method:
 *
 * class ABC {
 *
 *   constructor(a) {
 *     this.a = a;
 *   }
 *
 *   // required, for identify same instance
 *   __hash__() {
 *     return 'UNIQUE_INSTANCE_IDENTIFIER' + this.a;
 *   }
 *
 *   @memoize
 *   add(b) {
 *     return this.a + b;
 *   }
 *
 * }
 *
 */
export default function memoize(method) {
  const cachedMethod = _memoize(
    (self, args) => method.apply(self, args),
    {
      serializer: ([self, args]) => {
        if (self === undefined) {
          return 'undefined';
        }
        return JSON.stringify([self.__hash__(), args]);
      }
    }
  );
  return function() {
    return cachedMethod(this, arguments);
  };
}
