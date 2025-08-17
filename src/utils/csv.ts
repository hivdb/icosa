/* Don't ever add global flag to this regexp.
 * You have been warned: https://stackoverflow.com/a/1520853/2644759
 */
const CSV_ESCAPE_PATTERN = /([",\n\r])/;

/**
 * Escape a value for inclusion in a CSV cell.
 *
 * @param value - String value to escape.
 * @returns Escaped value.
 */
function csvEscape(value: string): string {
  value = value.replace(/"/g, '""');
  if (CSV_ESCAPE_PATTERN.test(value)) {
    value = `"${value}"`;
  }
  return value;
}

/**
 * Unescape a CSV cell value.
 */
function csvUnescape(value: string): string {
  if (CSV_ESCAPE_PATTERN.test(value)) {
    value = value.replace(/^"|"$/g, '');
    value = value.replace(/""/g, '"');
  }
  return value;
}

function _csvParse(text: string): string[][] {
  const cells = text.split(CSV_ESCAPE_PATTERN);
  let quoteCount = 0;
  let cellBuffer: string[] = [];
  let rowBuffer: string[] = [];
  const rows: string[][] = [];
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    if (/^[\n\r]$/.test(cell) && quoteCount % 2 === 0) {
      rowBuffer.push(csvUnescape(cellBuffer.join('')));
      rows.push(rowBuffer);
      cellBuffer = [];
      rowBuffer = [];
    }
    else if (cell === ',' && quoteCount % 2 === 0) {
      rowBuffer.push(csvUnescape(cellBuffer.join('')));
      cellBuffer = [];
    }
    else {
      cellBuffer.push(cell);
      if (cell === '"') {
        quoteCount += 1;
      }
    }
  }
  if (rowBuffer.length > 0 || cellBuffer.length > 0) {
    rowBuffer.push(csvUnescape(cellBuffer.join('')));
    rows.push(rowBuffer);
  }
  return rows;
}

/**
 * Parse a CSV string into rows or objects.
 *
 * @param text - CSV formatted string.
 * @param withHeader - When true, use first row as header and return objects.
 */
function csvParse(text: string, withHeader = true): any[] {
  let header: string[] | undefined;
  let rows: string[][] = [];
  for (const row of _csvParse(text)) {
    if (!row || row.length === 0) {
      continue;
    }
    if (row.length === 1 && row[0] === '') {
      continue;
    }
    rows.push(row);
  }
  if (withHeader) {
    [header, ...rows] = rows;
    return rows.map(row =>
      (header as string[]).reduce<Record<string, string>>((acc, k, idx) => {
        acc[k] = row[idx];
        return acc;
      }, {})
    );
  }
  else {
    return rows;
  }
}

/**
 * Stringify an array or object into a CSV row.
 */
function csvStringify(
  row: Record<string, any> | any[],
  options: {missing?: string; header?: string[] | null} = {missing: '', header: null}
): string {
  const missing = options.missing ?? '';
  if (options.header) {
    return options.header
      .map(h => (row as any)[h] ? csvEscape((row as any)[h].toString()) : missing)
      .join(',');
  }
  else {
    return (row as any[])
      .map(c => (c ? csvEscape(c.toString()) : missing))
      .join(',');
  }
}

/**
 * Stringify an array or object into a TSV row.
 */
function tsvStringify(
  row: Record<string, any> | any[],
  options: {missing?: string; header?: string[] | null} = {missing: '', header: null}
): string {
  const missing = options.missing ?? '';
  if (options.header) {
    return options.header
      .map(h =>
        (row as any)[h] !== null && (row as any)[h] !== undefined
          ? (row as any)[h].toString()
          : missing
      )
      .join('\t');
  }
  else {
    return (row as any[])
      .map(c =>
        c !== null && c !== undefined ? c.toString() : missing
      )
      .join('\t');
  }
}

export {csvEscape, csvUnescape, csvParse, csvStringify, tsvStringify};
