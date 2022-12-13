import {
  fetchPangolinResult
} from '../../../components/report/seq-summary/pango-lineage';


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


async function seqReadsSummary({
  sequenceReadsAnalysis,
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
    'Median Read Depth',
    'Permanent Link',
    'Minimum Read Depth',
    'NA Mixture Threshold',
    'Mut Detection Threshold',
    'NA Mixture - Actual',
    'Mut Detection - Actual'
  ];

  for (const seqResult of sequenceReadsAnalysis) {
    const {
      name: seqName,
      readDepthStats = {},
      availableGenes: genes,
      maxMixtureRate,
      minPrevalence,
      mixtureRate,
      actualMinPrevalence,
      minPositionReads,
      allGeneSequenceReads: geneSeqs
    } = seqResult;
    let {pangolin} = seqResult;
    if (!pangolin.loaded) {
      pangolin = await fetchPangolinResult(pangolin.asyncResultsURI);
    }
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
      'Median Read Depth': readDepthStats.median,
      'NA Mixture Threshold': `≤${maxMixtureRate * 100}%`,
      'Mut Detection Threshold': `≥${minPrevalence * 100}%`,
      'NA Mixture - Actual':
      `${(mixtureRate * 100).toFixed(3)}%`,
      'Mut Detection - Actual':
      `${(actualMinPrevalence * 100).toFixed(1)}%`,
      'Minimum Read Depth': minPositionReads,
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

export default seqReadsSummary;
