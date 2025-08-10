import {prepareData, prepareOutput} from './ext-codfish';

test('prepareData flattens codon reads', () => {
  const input = [
    {
      gene: {name: 'POL'},
      internalJsonAllPositionCodonReads: JSON.stringify([
        {
          position: 1,
          totalReads: 100,
          codonReads: [
            {
              refAminoAcid: 'A',
              aminoAcid: 'B',
              codon: 'AAA',
              reads: 10,
              aaPercent: 0.1,
              proportion: 0.1,
              codonPercent: 0.1,
              isDRM: false,
              isUnusual: false,
              isApobecMutation: false,
              isApobecDRM: false
            }
          ]
        }
      ])
    }
  ];
  const rows = prepareData(input);
  expect(rows[0].gene).toBe('POL');
  expect(rows[0].pos).toBe(1);
  expect(typeof rows[0].accumScore).toBe('number');
});

test('prepareOutput creates CSV string', () => {
  const rows = [
    {
      gene: 'POL',
      pos: 1,
      total: 100,
      cd: 'AAA',
      count: 10,
      ref: 'A',
      aa: 'B',
      pcnt: 0.1,
      aaPcnt: 0.2,
      cdPcnt: 0.3,
      isDRM: false,
      isUnusual: false,
      isApobecMutation: false,
      isApobecDRM: false
    }
  ];
  const csv = prepareOutput(rows as any);
  expect(csv).toContain('Gene,Position');
  expect(csv).toContain('POL');
});

