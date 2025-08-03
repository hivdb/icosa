import {parseFasta, concatFasta} from './fasta';

describe('fasta utilities', () => {
  it('parses fasta sequences', () => {
    const raw = '>a\nAT\n>b\nCG';
    const seqs = parseFasta(raw, 'file');
    expect(seqs).toHaveLength(2);
    expect(seqs[0]).toEqual({header: 'a', sequence: 'AT', size: 2});
  });

  it('concatenates sequences', () => {
    const res = concatFasta([{header: 'a', sequence: 'AT'}, {header: 'b', sequence: 'CG'}]);
    expect(res).toBe('>a\nAT\n>b\nCG');
  });
});
