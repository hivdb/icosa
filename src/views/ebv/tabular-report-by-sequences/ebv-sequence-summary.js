function joinCols(row) {
  for (const col of Object.keys(row)) {
    if (row[col] instanceof Array) {
      if (row[col].length > 0) {
        row[col] = row[col].join(',');
      }
      else if (col in row) {
        row[col] = 'None';
      }
    }
  }
}


function getMutations({
  geneSeqs,
  geneFilter,
  mutFilter,
  mutWithGene = true
}) {
  let results = [];
  for (const geneSeq of geneSeqs.filter(
    ({gene: {name}}) => geneFilter ? geneFilter(name) : true
  )) {
    const gene = geneSeq.gene.name.replace(/^_/, '');
    const mutations = geneSeq.mutations
      .filter(
        m => !m.isUnsequenced && (mutFilter ? mutFilter(m) : true)
      )
      .map(mut => ({...mut, gene}));
    results = [...results, ...mutations];
  }
  return results.map(
    ({gene, text}) => (
      mutWithGene ? `${gene}:${text}` : text
    )
  );
}


function getPermanentLink(seqName, geneSeqs, patternsTo, geneFilter) {
  const mutText = getMutations({geneSeqs, geneFilter});
  const link = new URL(patternsTo, window.location.href);
  const query = new URLSearchParams();
  query.set('name', seqName);
  query.set('mutations', mutText);
  link.search = query.toString();
  return link.toString();
}


async function sequenceSummary({
  sequenceAnalysis,
  config,
  patternsTo
}) {
  const rows = [];
  const {allGenes, geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Genes',
    ...allGenes.reduce(
      (acc, gene) => {
        acc.push(`${gene} Mutations`, `# ${gene} Mutations`);
        return acc;
      },
      []
    ),
    'Permanent Link'
  ];

  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      availableGenes: genes,
      alignedGeneSequences: geneSeqs
    } = seqResult;
    let row = {
      'Sequence Name': seqName,
      'Genes': genes.map(({name}) => geneDisplay[name] || name),
      ...allGenes.reduce(
        (acc, gene) => {
          acc[`${gene} Mutations`] = getMutations({
            geneSeqs,
            geneFilter: g => g === gene,
            mutWithGene: false
          });
          acc[`# ${gene} Mutations`] = geneSeqs.find(
            ({gene: {name}}) => name === gene
          ).mutationCount;
          return acc;
        },
        {}
      ),
      'Permanent Link': getPermanentLink(
        seqName,
        geneSeqs,
        patternsTo,
        () => true
      )
    };
    joinCols(row);
    rows.push(row);
  }
  return [{tableName: 'sequenceSummaries', header, rows}];
}

export default sequenceSummary;
