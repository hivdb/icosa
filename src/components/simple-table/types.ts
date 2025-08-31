import type {ReactNode} from 'react';
import type ColumnDefClass from './column-def';

/**
 * Function that sorts an array of rows based on a column name.
 * Used in the {@link SortColumn} interface.
 * @template T Type of the row data.
 * @param rows Array of row data to sort.
 * @param name Column name to sort by.
 * @returns New array of sorted rows.
 */
export type ColumnSort<R extends RowRecord> = (rows: R[], name: string) => R[];

/**
 * Sort information for a single column.
 */
export interface SortColumn<R extends RowRecord> {
  /** Column key used to access a cell value on a row. */
  name: string;
  /** Current direction for this column. */
  direction: 'ascending' | 'descending' | null;
  /** Whether to push null/empty values to the bottom. */
  nullsLast?: boolean;
  /** Sorter compatible with the SimpleTable pipeline. */
  sort: ColumnSort<R>;
}

/**
 * State returned by the sorting hook.
 */
export interface SortState<R extends RowRecord> {
  /** Active sort columns in application order. */
  columns: SortColumn<R>[];
  /** Sorted copy of the input data. */
  sortedData: R[];
}
/**
 * Generic row shape for SimpleTable data. Use a broad object type to allow
 * domain-specific row interfaces to be passed in without an index signature.
 */
export interface RowRecord {};

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

export type Decorator<T, R extends RowRecord> = (
  cellData: T,
  rowData: R,
  rowContext?: RowContext
) => T;

export type ColumnRender<T, R extends RowRecord> = (
  cellData: T,
  rowData: R,
  rowContext: RowContext,
  renderConfig: RenderConfig
) => ReactNode;

export type ColumnExportCell<T, R extends RowRecord> = (
  cellData: T,
  rowData: R
) => unknown;

export type SortKeyGetter<R extends RowRecord> = (row: R) => unknown;

export interface ColumnDefOptions<T, R extends RowRecord> {
  name: string;
  label?: ReactNode;
  exportLabel?: string;
  decorator?: Decorator<T, R>;
  render?: ColumnRender<T, R>;
  renderTpl?: string;
  renderConfig?: RenderConfig;
  exportCell?: ColumnExportCell<T, R>;
  exportRaw?: boolean;
  sort?: ColumnSort<R> | (string | SortKeyGetter<R>)[];
  sortable?: boolean;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  nullsLast?: boolean;
  none?: string;
  multiCells?: boolean;
  rowSpanKey?: string;
  rowSpanKeyGetter?: RowSpanKeyGetter;
  headCellStyle?: React.CSSProperties;
  bodyCellStyle?: React.CSSProperties;
  bodyCellColSpan?: number;
}

