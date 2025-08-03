import {describe, expect, it} from 'vitest';
import {dumpCSV, dumpTSV, dumpExcelSimple} from './sheet-utils';

describe('sheet utils', () => {
  const rows = [['a', 'b'], ['c', 'd']];
  it('dumps CSV and TSV', () => {
    expect(dumpCSV(rows)).toBe('a,b\nc,d');
    expect(dumpTSV(rows)).toBe('a\tb\nc\td');
  });
  it('creates excel blob', () => {
    const blob = dumpExcelSimple([['x']]);
    expect(blob.size).toBeGreaterThan(0);
  });
});
