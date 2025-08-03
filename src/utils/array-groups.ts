/**
 * Generate consecutive groups from an array according to a predicate.
 *
 * @param array - Source array.
 * @param predicate - Function determining if two items are consecutive.
 * @yields Arrays representing consecutive groups.
 */
export function* consecutiveGroupsBy<T>(
  array: T[],
  predicate: (left: T, right: T) => boolean
): Generator<T[], void, unknown> {
  for (let i = 0; i < array.length; i++) {
    let left = array[i];
    const group: T[] = [left];
    for (let j = i + 1; j < array.length; j++) {
      const right = array[j];
      if (predicate(left, right)) {
        group.push(right);
        left = right;
        i++;
      } else {
        break;
      }
    }
    yield group;
  }
}

/**
 * Convenience wrapper grouping consecutive numbers.
 *
 * @param array - Array of numbers.
 * @returns Generator of numeric groups.
 */
export function ConsecutiveGroupsByNumber(
  array: number[]
): Generator<number[], void, unknown> {
  return consecutiveGroupsBy(array, (left, right) => left + 1 === right);
}

