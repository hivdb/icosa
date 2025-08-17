import React from 'react';

/**
 * Create a lookup table from an array of position data.
 *
 * Each entry in the `positions` array is expected to have a `position` field.
 * The hook memoizes the computation so it is recomputed only when the
 * `positions` array reference changes.
 *
 * @param positions - Array of objects that contain a numeric `position` field.
 * @returns An object mapping position numbers to the corresponding data entry.
 */
export function usePositionLookup<T extends {position: number}>(positions: T[]): Record<number, T> {
  return React.useMemo(
    () =>
      positions.reduce<Record<number, T>>((acc, posdata) => {
        acc[posdata.position] = posdata;
        return acc;
      }, {}),
    [positions]
  );
}

export default usePositionLookup;
