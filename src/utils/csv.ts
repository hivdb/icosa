/** Regular expression used to escape CSV special characters. */
const CSV_ESCAPE_PATTERN = /([",\n\r])/;

/**
 * Escape a string for safe CSV usage.
 *
 * @param value - Raw cell value.
 * @returns Escaped cell string.
 */
function csvEscape(value: string): string {
  let escaped = value.replace(/"/g, '""');
  if (CSV_ESCAPE_PATTERN.test(escaped)) {
    escaped = `"${escaped}"`;
  }
  return escaped;
}

/**
 * Unescape a CSV cell string back to its original form.
 *
 * @param value - Escaped cell string.
 * @returns Unescaped string.
 */
function csvUnescape(value: string): string {
  let unescaped = value;
  if (CSV_ESCAPE_PATTERN.test(unescaped)) {
    unescaped = unescaped.replace(/^"|"$/g, '');
    unescaped = unescaped.replace(/""/g, '"');
  }
  return unescaped;
}

function _csvParse(text: string): string[][] {
  const cells = text.split(CSV_ESCAPE_PATTERN);
  let quoteCount = 0;
  let cellBuffer: string[] = [];
  let rowBuffer: string[] = [];
  let rows: string[][] = [];
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    if (/^[\n\r]$/.test(cell) && quoteCount % 2 === 0) {
      rowBuffer.push(csvUnescape(cellBuffer.join('')));
      rows.push(rowBuffer);
      cellBuffer = [];
      rowBuffer = [];
    } else if (cell === ',' && quoteCount % 2 === 0) {
      rowBuffer.push(csvUnescape(cellBuffer.join('')));
      cellBuffer = [];
    } else {
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
 * Parse CSV text into an array of objects or arrays.
 *
 * @param text - CSV text.
 * @param withHeader - When true, first row is treated as header.
 * @returns Parsed rows.
 */
function csvParse(
  text: string,
  withHeader = true
): Record<string, string>[] | string[][] {
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
    return rows.map((row) =>
      (header as string[]).reduce<Record<string, string>>((acc, k, idx) => {
        acc[k] = row[idx];
        return acc;
      }, {})
    );
  }
  return rows;
}

interface StringifyOptions {
  missing?: string;
  header?: string[] | null;
}

/**
 * Convert a row object or array to CSV string.
 *
 * @param row - Row data.
 * @param options - Missing value placeholder and optional header order.
 */
function csvStringify(
  row: Record<string, any> | any[],
  options: StringifyOptions = {missing: '', header: null}
): string {
  if (options.header) {
    return options.header
      .map((h) => (row[h] ? csvEscape(row[h].toString()) : options.missing))
      .join(',');
  }
  return (row as any[])
    .map((c) => (c ? csvEscape(c.toString()) : options.missing))
    .join(',');
}

/**
 * Convert a row object or array to TSV string.
 */
function tsvStringify(
  row: Record<string, any> | any[],
  options: StringifyOptions = {missing: '', header: null}
): string {
  if (options.header) {
    return options.header
      .map((h) =>
        (row[h] !== null && row[h] !== undefined)
          ? row[h].toString()
          : options.missing
      )
      .join('\t');
  }
  return (row as any[])
    .map((c) =>
      c !== null && c !== undefined ? c.toString() : options.missing
    )
    .join('\t');
}

export {csvEscape, csvUnescape, csvParse, csvStringify, tsvStringify};

