import parseCSV from 'csv-parse/lib/sync';
import {readFile, writeFile} from './file';

export function loadString(fileContent, columns = true, delimiter = ',') {
  let rows = parseCSV(fileContent, {
    skip_empty_lines: true,
    columns: columns
  });
  return rows;
}

export async function loadFile(file, columns = true, delimiter = ',') {
  const fileContent = await readFile(file);
  return loadString(fileContent, columns, delimiter);
}

function quoteString(text) {
  if (text.indexOf('"') === -1) {
    return text;
  }
  return `"${text.replace(/"/g, '\\"')}"`;
}

export function dumpString(rows, columns, delimiter = ',') {
  let data = [];
  data.push(columns.map(quoteString).join(delimiter));
  for (let row of rows) {
    row = columns.map(col => row[col]).map(quoteString).join(',');
    data.push(row);
  }
  return data.join('\n');
}

export function dumpFile(rows, columns, delimiter = ',') {
  const data = dumpString(rows, columns, delimiter);
  writeFile(data, 'text/tab-separated-values', fileName);
}

export default {loadFile, loadString, dumpFile, dumpString};
