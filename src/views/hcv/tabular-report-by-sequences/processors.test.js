import sequenceSummary from './sequence-summary';
import mutationList from './mutation-list';
import jsonReport from './json-report';

const sequenceAnalysis = [{
  inputSequence: {header: 'NS3-only'},
  bestMatchingSubtype: {display: 'Genotype 1a'},
  alignedGeneSequences: [{
    gene: {name: 'NS3'},
    mutations: [
      {
        position: 80,
        reference: 'Q',
        AAs: 'R',
        text: 'Q80R',
        isUnsequenced: false,
        triplet: 'AGG',
        isUnusual: false
      },
      {
        position: 87,
        reference: 'A',
        AAs: 'S',
        text: 'A87S',
        isUnsequenced: false,
        triplet: 'TCT',
        isUnusual: false
      }
    ]
  }]
}];

test('HCV CSV processors handle partial genes and classify mutations', () => {
  const [{tableName, rows: summaryRows}] = sequenceSummary({
    sequenceAnalysis,
    config: {allGenes: ['NS3', 'NS5A_NTD', 'NS5B']},
    patternsTo: '/hcv/by-patterns/report/'
  });
  expect(tableName).toBe('sequenceSummaries');
  expect(summaryRows[0]['Genes']).toBe('NS3');
  expect(summaryRows[0]['NS3 Major Mutations']).toBe('Q80R');
  expect(summaryRows[0]['NS3 Other Mutations']).toBe('A87S');
  expect(summaryRows[0]['# NS5A_NTD Major Mutations']).toBe(0);
  expect(summaryRows[0]['# NS5B Other Mutations']).toBe(0);

  const [{rows: mutationRows}] = mutationList({sequenceAnalysis});
  expect(mutationRows.map(row => row['Mutation Type']))
    .toEqual(['Major', 'Other']);

  const [{payload}] = jsonReport({sequenceAnalysis});
  const report = JSON.parse(payload).report;
  expect(report.alignedGeneSequences[0].mutations.map(
    mutation => mutation.mutationType
  )).toEqual(['Major', 'Other']);
});
