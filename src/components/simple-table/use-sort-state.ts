import React from 'react';
import type {SortState} from './types';

/**
 * Track sorting state for a data array.
 *
 * @param data - The array to be sorted.
 * @returns A tuple containing the current sort state and a setter
 *   function that mimics `React.useState`.
 */
export default function useSortState<T>(
  data: T[]
): [SortState, React.Dispatch<React.SetStateAction<SortState>>] {
  const prevData = React.useRef<T[] | null>(data);
  const [sortState, setSortState] = React.useState<SortState>({
    columns: [],
    sortedData: data
  });

  React.useEffect(() => {
    if (prevData.current !== data) {
      setSortState({
        columns: [],
        sortedData: data
      });
      prevData.current = data;
    }
  }, [data]);

  return [sortState, setSortState];
}
