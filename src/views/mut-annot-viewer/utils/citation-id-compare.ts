/**
 * Compare two citation identifier strings of the form `A.B` where `A` and `B`
 * are numeric segments.
 *
 * @param a - First citation id.
 * @param b - Second citation id.
 * @returns A negative number if `a < b`, positive if `a > b`, or zero if equal.
 */
export function citationIdCompare(a: string, b: string): number {
  let a0: number, a1: number, b0: number, b1: number;
  [a0, a1] = a.split('.').map((v) => parseInt(v, 10));
  [b0, b1] = b.split('.').map((v) => parseInt(v, 10));
  const diff = a0 - b0;
  return diff !== 0 ? diff : a1 - b1;
}

export default citationIdCompare;
