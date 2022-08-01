import sortBy from 'lodash/sortBy';
import nestedGet from 'lodash/get';
import startCase from 'lodash/startCase';


export function createUnsafeRenderFromTpl(tpl, escapeHtml = false) {
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
    );
  }
  else {
    /* eslint-disable-next-line no-new-func */
    return new Function(
      'cellData',
      'rowData',
      'rowContext',
      'renderConfig',
      `return \`${tpl}\`;`
    );
  }
}


function coerceRender({render, decorator, renderTpl, none}) {
  let myRender;
  if (render) {
    myRender = render;
  }
  else if (renderTpl) {
    myRender = createUnsafeRenderFromTpl(renderTpl);
  }
  else {
    myRender = cellData => (
      (cellData === undefined ||
      cellData === null ||
      cellData === '') ? none : cellData
    );
  }
  if (decorator) {
    return (cellData, ...args) => (
      myRender(decorator(cellData, ...args), ...args)
    );
  }
  else {
    return myRender;
  }
}


function coerceExportCell({exportCell, exportRaw, decorator}) {
  let myExportCell = exportCell;
  if (!exportCell && exportRaw) {
    myExportCell = cellData => cellData;
  }
  if (decorator && myExportCell) {
    return (cellData, ...args) => (
      myExportCell(decorator(cellData, ...args), ...args)
    );
  }
  else {
    return myExportCell;
  }
}


function coerceSort({sort, decorator, name}) {
  let mySort = sort;
  if (!sort && decorator) {
    mySort = rows => sortBy(rows, row => decorator(
      nestedGet(row, name),
      row
    ));
  }
  else if (!sort) {
    mySort = rows => sortBy(rows, [name]);
  }
  else if (sort && typeof sort !== 'function') {
    const sortKeys = mySort.map(key => (
      // prepend name to string key
      key instanceof Function ? key : `${name}.${key}`
    ));
    mySort = rows => sortBy(rows, row => sortKeys.map(
      key => key instanceof Function ?
        key(row) :
        nestedGet(row, key) ||
        ''
    ));
  }
  else {
    mySort = sort;
  }
  return mySort;
}


export default class ColumnDef {

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
  }) {
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
    this.multiCells = multiCells;
    this.rowSpanKey = rowSpanKey;
    this.rowSpanKeyGetter = rowSpanKeyGetter;
    this.headCellStyle = headCellStyle;
    this.bodyCellStyle = bodyCellStyle;
    this.bodyCellColSpan = bodyCellColSpan;
  }

}
