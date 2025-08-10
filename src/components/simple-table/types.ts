import type ColumnDefClass from './column-def';
import type {ColumnSort} from './column-def';

export type ColumnDef = InstanceType<typeof ColumnDefClass>;


/** Sort information for a single column. */
export interface SortColumn {
  name: string;
  direction: 'ascending' | 'descending' | null;
  nullsLast?: boolean;
  sort: ColumnSort;
}

/** State returned by the sorting hook. */
export interface SortState {
  columns: SortColumn[];
  sortedData: any[];
}
