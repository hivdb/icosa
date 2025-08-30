import type React from 'react';
import type {ReactNode} from 'react';
import sortBy from 'lodash/sortBy';
import nestedGet from 'lodash/get';
import startCase from 'lodash/startCase';
import type {RowRecord, RowContext, RenderConfig, RowSpanKeyGetter} from './types';

/**
 * Create a renderer function from a template string.
 *
 * @param tpl - JavaScript template string used to render a cell.
 * @param escapeHtml - When true the generated function will escape HTML
 *   entities in the output to avoid XSS risks.
 * @returns A function that takes four arguments: cellData, rowData,
 *   rowContext and renderConfig and returns a string.
 */
export function createUnsafeRenderFromTpl(
  tpl: string,
  escapeHtml = false
): ColumnRender {
  // Note: never allow ColumnDef from UGC data
  if (escapeHtml) {
    /* eslint-disable-next-line no-new-func */
      return new Function(
        'cellData',
        'rowData',
        'rowContext',
        'renderConfig',
        `
        function escapeHtml(strings, ...args) {
        const results = [strings[0]];
        for (let i = 0; i < args.length; i ++) {
          if (typeof args[i] === 'string' || args[i] instanceof String) {
            results.push(
              args[i]
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
            );
          }
          else {
            results.push(args[i]);
          }
          results.push(strings[i + 1]);
        }
        return results.join('');
      }
      return escapeHtml\`${tpl}\`;
        `
      ) as ColumnRender;
    }
    else {
      /* eslint-disable-next-line no-new-func */
      return new Function(
        'cellData',
        'rowData',
        'rowContext',
        'renderConfig',
        `return \`${tpl}\`;`
      ) as ColumnRender;
    }
  }

interface CoerceRenderOptions {
  render?: ColumnRender;
  decorator?: Decorator;
  renderTpl?: string;
  none?: ReactNode;
}

/**
 * Normalize various render options into a single render function.
 */
function coerceRender({
  render,
  decorator,
  renderTpl,
  none
}: CoerceRenderOptions): ColumnRender {
  let myRender: ColumnRender;
  if (render) {
    myRender = render;
  }
  else if (renderTpl) {
    myRender = createUnsafeRenderFromTpl(renderTpl);
  }
  else {
    myRender = cellData => (
      cellData === undefined ||
      cellData === null ||
      cellData === ''
        ? none
        : cellData as ReactNode
    );
  }
  if (decorator) {
    return (
      cellData: unknown,
      rowData: RowRecord,
      rowContext: RowContext,
      renderConfig: RenderConfig
    ) =>
      myRender(
        decorator(cellData, rowData, rowContext),
        rowData,
        rowContext,
        renderConfig
      );
  }
  return myRender;
}

interface CoerceExportCellOptions {
  exportCell?: ColumnExportCell;
  exportRaw?: boolean;
  decorator?: Decorator;
}

/**
 * Normalize export cell options into a consistent function.
 */
function coerceExportCell({
  exportCell,
  exportRaw,
  decorator
}: CoerceExportCellOptions): ColumnExportCell | undefined {
  let myExportCell = exportCell;
  if (!exportCell && exportRaw) {
    myExportCell = cellData => cellData;
  }
  if (decorator && myExportCell) {
    return (cellData, rowData) =>
      myExportCell!(decorator(cellData, rowData), rowData);
  }
  return myExportCell;
}

interface CoerceSortOptions {
  sort?: ColumnSort | Array<string | ColumnSort>;
  decorator?: Decorator;
  name: string;
}

/**
 * Normalize the sorting configuration into a sort function.
 */
function coerceSort({
  sort,
  decorator,
  name
}: CoerceSortOptions): ColumnSort {
  let mySort: ColumnSort | undefined;
  if (!sort && decorator) {
    mySort = rows =>
      sortBy(rows, row => decorator(nestedGet(row, name), row));
  }
  else if (!sort) {
    mySort = rows => sortBy(rows, [name]);
  }
  else if (Array.isArray(sort)) {
    const sortKeys = sort.map(key =>
      key instanceof Function
        ? key
        : (row: RowRecord) => nestedGet(row, `${name}.${key}`) || ''
    );
    mySort = (rows: RowRecord[]) => sortBy(rows, sortKeys) as RowRecord[];
  }
  else {
    mySort = sort;
  }
  return mySort!;
}

export type Decorator = (
  cellData: unknown,
  rowData: RowRecord,
  rowContext?: RowContext
) => ReactNode;

export type ColumnRender = (
  cellData: unknown,
  rowData: RowRecord,
  rowContext: RowContext,
  renderConfig: RenderConfig
) => ReactNode;

export type ColumnExportCell = (
  cellData: unknown,
  rowData: RowRecord
) => unknown;

export type ColumnSort = (rows: RowRecord[], name: string) => RowRecord[];

export interface ColumnDefOptions {
  name: string;
  label?: ReactNode;
  exportLabel?: string;
  decorator?: Decorator;
  render?: ColumnRender;
  renderTpl?: string;
  renderConfig?: RenderConfig;
  exportCell?: ColumnExportCell;
  exportRaw?: boolean;
  sort?: ColumnSort | Array<string | ColumnSort>;
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

/**
 * Definition for a table column used by {@link SimpleTable}.
 */
export default class ColumnDef implements ColumnDefOptions {
  name: string;
  label: ReactNode;
  exportLabel?: string;
  decorator?: Decorator;
  render: ColumnRender;
  renderTpl?: string;
  renderConfig: RenderConfig;
  exportCell?: ColumnExportCell;
  sort: ColumnSort;
  sortable: boolean;
  textAlign: 'left' | 'right' | 'center' | 'justify';
  nullsLast: boolean;
  none: string;
  multiCells: boolean;
  rowSpanKey?: string;
  rowSpanKeyGetter?: RowSpanKeyGetter;
  headCellStyle: React.CSSProperties;
  bodyCellStyle: React.CSSProperties;
  bodyCellColSpan: number;

  /** Create a ColumnDef object
   *
   * @param {string} name         - Column internal name/key, required.
   * @param {node} label          - Display name/label.
   * @param {string} exportLabel  - Label used in TSV/CSV/Excel output.
   * @param {function} decorator  - A function to decorate cell data before it
   *                                was passed to render, exportCell, and the
   *                                default sort function. Note any customized
   *                                sort function should decorate any data
   *                                by itself.
   * @param {function} render     - A function to return React element, can
   *                                accept four arguments: cellData, rowData,
   *                                rowContext, and renderConfig.
   * @param {string} renderTpl    - An alternative way to create render
   *                                function using JavaScript template string.
   *                                Four arguments of render function are
   *                                available for the template.
   * @param {object} renderConfig - renderConfig to be passed to render as the
   *                                4th argument.
   * @param {function} exportCell - A function to provide alternative cell data
   *                                for copy tsv/export csv/excel operation.
   *                                Should return array, object, or plain type.
   * @param {bool} exportRaw      - Instead of using value from HTML table
   *                                cells, set this param to true will allow
   *                                exporting raw cell data for copy tsv/export
   *                                csv/excel operation.
   * @param {list/function} sort  - A list of sort keys (lodash/sortBy style)
   *                                or a function accepting input row array and
   *                                returning sorted row array.
   * @param {bool} sortable       - Flag for enable/disable sorting feature.
   * @param {string} textAlign    - CSS text-align.
   * @param {bool} nullsLast      - Flag for always placing cellData at the end
   *                                of the table when they are empty or
   *                                undefined.
   * @param {string} none         - String to be displayed when cellData are
   *                                empty or undefined. Only used if render
   *                                function is not provided.
   * @param {bool} multiCells     - Flag to enable/disable rowspan merging of
   *                                neighboring cells with the same value.
   * @param {string} rowSpanKey   - Key for rowspan merging of neighboring
   *                                cells. Default to the value of param `name`.
   * @param {string} rowSpanKeyGetter - Key getter function for rowspan merging
   *                                    of neighboring cells. This function
   *                                    accept a row object as input parameter.
   *                                    It overrides rowSpanKey when specified.
   * @param {object} headCellStyle - Inline style for head cell
   * @param {object} bodyCellStyle - Inline style for body cell
   * @param {number} bodyCellColSpan - Raw value of colspan for body cell
   */
  constructor({
    name,
    label,
    exportLabel,
    decorator,
    render,
    renderTpl,
    renderConfig = {},
    exportCell,
    exportRaw,
    sort,
    sortable = true,
    textAlign = 'center',
    nullsLast = false,
    none = '?',
    multiCells = false,
    rowSpanKey,
    rowSpanKeyGetter,
    headCellStyle = {},
    bodyCellStyle = {},
    bodyCellColSpan = 1
  }: ColumnDefOptions) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.exportLabel = exportLabel;
    this.decorator = decorator;
    this.render = coerceRender({render, decorator, renderTpl, none});
    this.exportCell = coerceExportCell({exportCell, decorator, exportRaw});
    this.sort = coerceSort({sort, decorator, name});
    this.renderConfig = renderConfig;
    this.sortable = Boolean(sortable);
    this.textAlign = textAlign;
      this.nullsLast = nullsLast;
      this.none = none;
      this.multiCells = multiCells;
    this.rowSpanKey = rowSpanKey;
    this.rowSpanKeyGetter = rowSpanKeyGetter;
    this.headCellStyle = headCellStyle;
    this.bodyCellStyle = bodyCellStyle;
    this.bodyCellColSpan = bodyCellColSpan;
  }

}
