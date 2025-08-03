/**
 * Group consecutive items in an array using a predicate.
 *
 * @param array - Source array to iterate.
 * @param predicate - Function returning `true` if two items are consecutive.
 * @returns Generator yielding arrays of grouped items.
 */
export function* consecutiveGroupsBy<T>(
  array: T[],
  predicate: (left: T, right: T) => boolean
): Generator<T[]> {
  for (let i = 0; i < array.length; i++) {
    let left = array[i];
    const group: T[] = [left];
    for (let j = i + 1; j < array.length; j++) {
      const right = array[j];
      if (predicate(left, right)) {
        group.push(right);
        left = right;
        i++;
      }
      else {
        break;
      }
    }
    yield group;
  }
}

/**
 * Convenience helper for grouping sequences of consecutive numbers.
 *
 * @param array - Array of numbers to group.
 * @returns Generator of number groups where each group contains consecutive numbers.
 */
export function ConsecutiveGroupsByNumber(
  array: number[]
): Generator<number[]> {
  return consecutiveGroupsBy(array, (left, right) => left + 1 === right);
}
