import {describe, expect, it} from 'vitest';
import {csvEscape, csvUnescape, csvParse, csvStringify, tsvStringify} from './csv';

describe('csv utilities', () => {
  it('escapes and unescapes', () => {
    const escaped = csvEscape('a,b');
    expect(escaped).toBe('"a,b"');
    expect(csvUnescape(escaped)).toBe('a,b');
  });

  it('parses and stringifies', () => {
    const text = 'a,b\n1,2';
    expect(csvParse(text)).toEqual([{a:'1', b:'2'}]);
    expect(csvStringify(['1','2'])).toBe('1,2');
    expect(tsvStringify(['1','2'])).toBe('1\t2');
  });
});
