import {mutationGroups} from '../drm';

function mutationTexts(mutations) {
  return mutations.length > 0 ?
    mutations.map(({text}) => text).join(',') : 'None';
}

export default function sequenceSummary({
  sequenceAnalysis,
  config,
  patternsTo
}) {
  const {allGenes} = config;
  const header = [
    'Sequence Name',
    'Genes',
    'Genotype',
    ...allGenes.flatMap(gene => [
      `${gene} Major Mutations`,
      `# ${gene} Major Mutations`,
      `${gene} Other Mutations`,
      `# ${gene} Other Mutations`
    ]),
    'Permanent Link'
  ];
  const rows = sequenceAnalysis.map(({
    inputSequence: {header: seqName},
    bestMatchingSubtype,
    alignedGeneSequences: geneSeqs
  }) => {
    const link = new URL(patternsTo, window.location.href);
    const query = new URLSearchParams();
    query.set('name', seqName);
    query.set('mutations', geneSeqs.flatMap(({gene, mutations}) => (
      (mutations || []).filter(mut => !mut.isUnsequenced).map(
        ({text}) => `${gene.name}:${text}`
      )
    )).join(','));
    link.search = query.toString();

    const row = {
      'Sequence Name': seqName,
      'Genes': geneSeqs.map(({gene}) => gene.name).join(','),
      'Genotype': bestMatchingSubtype?.display || 'Unknown',
      'Permanent Link': link.toString()
    };
    for (const gene of allGenes) {
      const geneSeq = geneSeqs.find(({gene: {name}}) => name === gene);
      const [major, other] = mutationGroups(
        gene,
        geneSeq?.mutations || []
      );
      row[`${gene} Major Mutations`] = mutationTexts(major.mutations);
      row[`# ${gene} Major Mutations`] = major.mutations.length;
      row[`${gene} Other Mutations`] = mutationTexts(other.mutations);
      row[`# ${gene} Other Mutations`] = other.mutations.length;
    }
    return row;
  });
  return [{tableName: 'sequenceSummaries', header, rows}];
}
