import {reformCodFreqs} from './index';

it('reforms codfreq structure', () => {
  const input = [{
    name: 'sample.codfreq',
    allReads: [
      {allCodonReads: [{codon: 'AAA', reads: 1}], gene: 'g', position: 1}
    ]
  }];
  const result = reformCodFreqs(input as any, (g: string, p: number) => [g, p]);
  expect(result[0].name).toBe('sample');
  expect(result[0].allReads[0].allCodonReads[0]).toEqual({
    codon: 'AAA',
    reads: 1
  });
});

