import {describe, expect, it} from 'vitest';
import {buildGeneValidator, parseSequenceReads} from '../../../src/utils/sequence-reads';

describe('sequence-reads', () => {
  it('builds gene validator', () => {
    const validator = buildGeneValidator([{regexp: '^gp41$', gene: 'GP41'}]);
    expect(validator('gp41', 1)).toEqual(['GP41', 1]);
    expect(validator('unknown', 1)).toEqual([null, null]);
  });

  it('parses csv codfreq', () => {
    const validator = (gene: string, pos: number) => [gene, pos] as [string, number];
    const data = 'gene,pos,depth,codon,codonReads\nPR,1,100,AAA,100\n';
    const res = parseSequenceReads('sample', data, validator);
    expect(res.name).toBe('sample');
    expect(res.allReads[0].gene).toBe('PR');
  });
});
