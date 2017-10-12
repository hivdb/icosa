import parseCSV from 'csv-parse/lib/sync';
import {readFile, writeFile} from './file';

export function loadString(fileContent, headers, delimiter = ',', omit_first_row = true) {
  let rows = parseCSV(fileContent, {
    delimiter, trim: true,
    skip_empty_lines: true,
    columns: headers
  });
  if (rows.length && omit_first_row) {
    rows.splice(0, 1);
  }
  return rows;
}

export async function loadFile(file, headers, delimiter = ',', omit_first_row = true) {
  const fileContent = await readFile(file);
  return loadString(fileContent, headers, delimiter, omit_first_row, defaults);
}

function quoteString(text) {
  if (text.indexOf('"') === -1) {
    return text;
  }
  return `"${text.replace(/"/g, '\\"')}"`;
}

export function dumpString(rows, headers, delimiter = ',') {
  let data = [];
  data.push(headers.map(quoteString).join(delimiter));
  for (let row of rows) {
    row = headers.map(col => row[col]).map(quoteString).join(',');
    data.push(row);
  }
  return data.join('\n');
}

export function dumpFile(rows, headers, delimiter = ',') {
  const data = dumpString(rows, headers, delimiter);
  writeFile(data, 'text/tab-separated-values', fileName);
}
