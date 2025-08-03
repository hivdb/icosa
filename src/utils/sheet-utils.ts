import {
  write as xlsxWrite,
  utils as xlsxUtils
} from 'xlsx';
import escapeRegExp from 'lodash/escapeRegExp';

/**
 * Dump rows to a CSV formatted string.
 *
 * @param rows - Array of rows where each row is an array of strings.
 * @param delimiter - Field delimiter, defaults to comma.
 * @param utf8bom - Whether to prefix the output with UTF-8 BOM.
 * @returns CSV formatted string.
 */
export function dumpCSV(
  rows: string[][],
  delimiter = ',',
  utf8bom = false
): string {
  // TODO: use csv.js instead
  delimiter = delimiter.slice(0, 1);
  const pattern = new RegExp(`["\r\n${escapeRegExp(delimiter)}]`);
  let prepend = '';
  if (utf8bom) {
    prepend = '\ufeff';
  }

  return (
    prepend +
    rows
      .map(row =>
        row
          .map(cell =>
            pattern.test(cell)
              ? `"${cell.replace('"', '""')}"`
              : cell
          )
          .join(delimiter)
      )
      .join('\n')
  );
}

/**
 * Dump rows to a TSV formatted string.
 */
export function dumpTSV(
  rows: string[][],
  delimiter = '\t',
  utf8bom = false
): string {
  // TODO: use csv.js instead
  return dumpCSV(rows, delimiter, utf8bom);
}

/**
 * Create a simple Excel sheet from 2D array data.
 *
 * @param rows - Matrix of cell values.
 * @param sheetName - Worksheet name.
 * @param config - Additional worksheet configuration.
 * @returns Blob containing the XLSX file.
 */
export function dumpExcelSimple(
  rows: string[][],
  sheetName = 'Sheet1',
  config: Record<string, any> = {}
): Blob {
  const wb = xlsxUtils.book_new();
  const ws = xlsxUtils.aoa_to_sheet(rows);
  for (const key in ws) {
    if (key.startsWith('!')) {
      continue;
    }
    const cell = (ws as any)[key];
    cell.s = {alignment: {wrapText: true}};
  }
  for (const [key, value] of Object.entries(config)) {
    (ws as any)[key] = value;
  }
  xlsxUtils.book_append_sheet(wb, ws, sheetName);
  const wopts = {
    bookType: 'xlsx' as const,
    bookSST: true,
    type: 'array' as const,
    cellStyles: true
  };
  const wbout = xlsxWrite(wb, wopts);
  return new Blob(
    [wbout],
    {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
  );
}
