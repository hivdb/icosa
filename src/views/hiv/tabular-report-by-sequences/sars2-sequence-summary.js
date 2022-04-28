import shortenMutationList from '../../../utils/shorten-mutation-list';


function joinCols(row, ...cols) {
  for (const col of cols) {
    if (row[col] && row[col].length > 0) {
      row[col] = row[col].join(',');
    }
    else if (col in row) {
      row[col] = 'None';
    }
  }
}


function getMutations(geneSeqs, geneFilter, geneDisplay, raw = false) {
  let results = [];
  for (const geneSeq of geneSeqs.filter(
    ({gene: {name}}) => geneFilter(name)
  )) {
    const gene = geneSeq.gene.name;
    const mutations = geneSeq.mutations
      .filter(
        ({isUnsequenced}) => !isUnsequenced
      )
      .map(mut => ({...mut, gene}));
    if (raw) {
      results = [...results, ...mutations];
    }
    else {
      results = [...results, ...shortenMutationList(mutations)];
    }
  }
  return results.map(
    ({gene, text}) => (
      gene === 'S' ? text : `${geneDisplay[gene] || gene}:${text}`
    )
  );
}


function getPermanentLink(seqName, geneSeqs, patternsTo, geneFilter) {
  const mutText = getMutations(geneSeqs, geneFilter, {}, true);
  const link = new URL(patternsTo, window.location.href);
  const query = new URLSearchParams();
  query.set('name', seqName);
  query.set('mutations', mutText);
  link.search = query.toString();
  return link.toString();
}


function sequenceSummary({
  currentProgramVersion,
  sequenceAnalysis,
  config,
  patternsTo
}) {
  const rows = [];
  const {geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Genes',
    'Spike Mutations',
    'Other Mutations',
    'Permanent Link (Spike Only)',
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
      'Spike Mutations': getMutations(
        geneSeqs, gene => gene === 'S', geneDisplay
      ),
      'Other Mutations': getMutations(
        geneSeqs, gene => gene !== 'S', geneDisplay
      ),
      'Permanent Link (Spike Only)': getPermanentLink(
        seqName, geneSeqs, patternsTo, gene => gene === 'S'
      ),
      'Permanent Link': getPermanentLink(
        seqName, geneSeqs, patternsTo, () => true
      )
    };
    joinCols(row, ['genes', 'Spike Mutations', 'Other Mutations']);
    rows.push(row);
  }
  return [{tableName: 'sequenceSummaries', header, rows}];
}

export default sequenceSummary;