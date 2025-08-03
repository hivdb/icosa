import type ColumnDef from './column-def';
import type {ColumnSort} from './column-def';

/** Definition for a column passed to SimpleTable. */
export type {ColumnDef};

/** Sort information for a single column. */
export interface SortColumn {
  name: string;
  direction: 'ascending' | 'descending' | null;
  nullsLast: boolean;
  sort: ColumnSort;
}

/** State returned by the sorting hook. */
export interface SortState {
  columns: SortColumn[];
  sortedData: any[];
}
