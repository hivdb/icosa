import {reformCodFreqs} from './index';

describe('reformCodFreqs', () => {
  /**
   * Ensure raw codfreq files are normalized and extraneous fields stripped.
   */
  it('reforms codfreq structure', () => {
    const input = [{
      name: 'sample.codfreq',
      extra: true,
      allReads: [
        {
          allCodonReads: [{codon: 'AAA', reads: 1, keep: true}],
          gene: 'g',
          position: 1,
          junk: 'remove'
        }
      ]
    }];
    const result = reformCodFreqs(input as any, (g: string, p: number) => [g, p]);
    expect(result[0].name).toBe('sample');
    expect(result[0].extra).toBe(true);
    expect(result[0].allReads[0]).toEqual({
      allCodonReads: [{codon: 'AAA', reads: 1}],
      gene: 'g',
      position: 1
    });
  });
});

