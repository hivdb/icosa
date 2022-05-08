import {
  write as xlsxWrite,
  utils as xlsxUtils
} from 'xlsx';
import escapeRegExp from 'lodash/escapeRegExp';

export function dumpCSV(rows, delimiter = ',', utf8bom = false) {
  // TODO: use csv.js instead
  delimiter = delimiter.slice(0, 1);
  const pattern = new RegExp(`["\r\n${escapeRegExp(delimiter)}]`);
  let prepend = '';
  if (utf8bom) {
    prepend = '\ufeff';
  }

  return prepend + rows.map(row => (
    row.map(cell => (
      pattern.test(cell) ?
        `"${cell.replace('"', '""')}"` :
        cell
    )).join(delimiter)
  )).join('\n');
}

export function dumpTSV(rows, delimiter = '\t', utf8bom = false) {
  // TODO: use csv.js instead
  return dumpCSV(rows, delimiter, utf8bom);
}

export function dumpExcelSimple(
  rows,
  sheetName = 'Sheet1',
  config = {}
) {
  const wb = xlsxUtils.book_new();
  const ws = xlsxUtils.aoa_to_sheet(rows);
  for (const key in ws) {
    if (key.startsWith('!')) {
      continue;
    }
    const cell = ws[key];
    cell.s = {alignment: {wrapText: true}};
  }
  for (const [key, value] of Object.entries(config)) {
    ws[key] = value;
  }
  xlsxUtils.book_append_sheet(wb, ws, sheetName);
  const wopts = {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
    cellStyles: true
  };
  const wbout = xlsxWrite(wb, wopts);
  return new Blob(
    [wbout],
    {tyle: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
  );
}
