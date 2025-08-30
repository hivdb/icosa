import type ColumnDefClass from './column-def';
import type {ColumnSort} from './column-def';

/**
 * Sort information for a single column.
 */
export interface SortColumn {
  /** Column key used to access a cell value on a row. */
  name: string;
  /** Current direction for this column. */
  direction: 'ascending' | 'descending' | null;
  /** Whether to push null/empty values to the bottom. */
  nullsLast?: boolean;
  /** Sorter compatible with the SimpleTable pipeline. */
  sort: ColumnSort;
}

/**
 * State returned by the sorting hook.
 */
export interface SortState<T = RowRecord> {
  /** Active sort columns in application order. */
  columns: SortColumn[];
  /** Sorted copy of the input data. */
  sortedData: T[];
}
/**
 * Generic row shape for SimpleTable data. Use a broad object type to allow
 * domain-specific row interfaces to be passed in without an index signature.
 */
export type RowRecord = Record<string, unknown>;


/**
 * Function to extract a string key from a row for rowspan calculations.
 */
export type RowSpanKeyGetter = (row: RowRecord) => unknown;

/**
 * Context object passed to cell renderers for additional information.
 */
export type RowContext = Record<string, unknown>;

/**
 * Configuration object passed to cell renderers for custom behavior.
 */
export type RenderConfig = Record<string, unknown>;
