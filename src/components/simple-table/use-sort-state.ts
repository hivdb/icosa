import React from 'react';
import type {SortState, RowRecord} from './types';

/**
 * Track sorting state for a data array.
 *
 * @param data - The array to be sorted.
 * @returns A tuple containing the current sort state and a setter
 *   function that mimics `React.useState`.
 */
export default function useSortState<R extends RowRecord>(
  data: R[]
): [SortState<R>, React.Dispatch<React.SetStateAction<SortState<R>>>] {
  const prevData = React.useRef<R[] | null>(data);
  const [sortState, setSortState] = React.useState<SortState<R>>({
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
