/* Don't ever add global flag to this regexp.
 * You have been warned: https://stackoverflow.com/a/1520853/2644759
 */
const CSV_ESCAPE_PATTERN = /([",\n\r])/;

function csvEscape(value) {
  value = value.replace(/"/g, '""');
  if (CSV_ESCAPE_PATTERN.test(value)) {
    value = `"${value}"`;
  }
  return value;
}

function csvUnescape(value) {
  if (CSV_ESCAPE_PATTERN.test(value)) {
    value = value.replace(/^"|"$/g, '');
    value.replace(/""/g, '"');
  }
  return value;
}

function _csvParse(text) {
  const cells = text.split(CSV_ESCAPE_PATTERN);
  let quoteCount = 0;
  let cellBuffer = [];
  let rowBuffer = [];
  const rows = [];
  for (let idx = 0; idx < cells.length; idx ++) {
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
  return rows;
}

function csvParse(text, withHeader = true) {
  let header;
  let rows = [];
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
    return rows.map(
      row => header.reduce((acc, k, idx) => {
        acc[k] = row[idx];
        return acc;
      }, {})
    );
  }
  else {
    return rows;
  }
}

function csvStringify(row, options = {missing: '', header: null}) {
  if (options.header) {
    return options.header.map(h => (
      row[h] ? csvEscape(row[h].toString()) : options.missing
    )).join(',');
  }
  else {
    return row.map(c => (
      c ? csvEscape(c.toString()) : options.missing
    )).join(',');
  }
}

function tsvStringify(row, options = {missing: '', header: null}) {
  if (options.header) {
    return options.header.map(h => (
      (row[h] !== null && row[h] !== undefined) ?
        row[h].toString() : options.missing
    )).join('\t');
  }
  else {
    return row.map(c => (
      (c !== null && c !== undefined) ?
        c.toString() : options.missing
    )).join('\t');
  }
}

export {csvEscape, csvUnescape, csvParse, csvStringify, tsvStringify};
