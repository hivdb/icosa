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
  const {geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Genes',
    'Spike Mutations',
    'Spike mAb-RMs',
    '3CLpro Mutations',
    '3CL-PI DRMs',
    'RdRP Mutations',
    'RdRPI DRMs',
    'Other Mutations',
    '# Mutations',
    '# Unusual Mutations',
    '# Spike Mutations',
    '# Spike Unusual Mutations',
    'Median Read Depth',
    'PANGO Lineage',
    'PANGO Version',
    'Spike Variant',
    'Permanent Link (Spike Only)',
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
      bestMatchingSubtype,
      allGeneSequenceReads: geneSeqs
    } = seqResult;
    let {pangolin} = seqResult;
    if (!pangolin.loaded) {
      pangolin = await fetchPangolinResult(pangolin.asyncResultsURI);
    }
    const spikeGeneSeq = geneSeqs.find(({gene: {name: gene}}) => gene === 'S');
    let row = {
      'Sequence Name': seqName,
      'Genes': genes.map(({name}) => geneDisplay[name] || name),
      'Spike Mutations': getMutations({
        geneSeqs,
        geneFilter: gene => gene === 'S',
        mutWithGene: false
      }),
      'Spike mAb-RMs': getMutations({
        geneSeqs,
        geneFilter: gene => gene === 'S',
        mutFilter: m => m.isDRM,
        mutWithGene: false
      }),
      '3CLpro Mutations': getMutations({
        geneSeqs,
        geneFilter: gene => gene === '_3CLpro',
        mutWithGene: false
      }),
      '3CL-PI DRMs': getMutations({
        geneSeqs,
        geneFilter: gene => gene === '_3CLpro',
        mutFilter: m => m.isDRM,
        mutWithGene: false
      }),
      'RdRP Mutations': getMutations({
        geneSeqs,
        geneFilter: gene => gene === 'RdRP',
        mutWithGene: false
      }),
      'RdRPI DRMs': getMutations({
        geneSeqs,
        geneFilter: gene => gene === 'RdRP',
        mutFilter: m => m.isDRM,
        mutWithGene: false
      }),
      'Other Mutations': getMutations({
        geneSeqs,
        geneFilter: (
          gene => gene !== 'S' &&
          gene !== '_3CLpro' &&
          gene !== 'RdRP'
        )
      }),
      '# Mutations': `${seqResult.mutationCount}`,
      '# Unusual Mutations': `${seqResult.unusualMutationCount}`,
      '# Spike Mutations': `${
        spikeGeneSeq ? spikeGeneSeq.mutationCount : null
      }`,
      '# Spike Unusual Mutations': `${
        spikeGeneSeq ? spikeGeneSeq.unusualMutationCount : null
      }`,
      'Median Read Depth': readDepthStats.median,
      'PANGO Lineage': pangolin.lineage,
      'PANGO Version': pangolin.version,
      'Spike Variant': (bestMatchingSubtype || {}).display || null,
      'NA Mixture Threshold': `≤${maxMixtureRate * 100}%`,
      'Mut Detection Threshold': `≥${minPrevalence * 100}%`,
      'NA Mixture - Actual':
      `${(mixtureRate * 100).toFixed(3)}%`,
      'Mut Detection - Actual':
      `${(actualMinPrevalence * 100).toFixed(1)}%`,
      'Minimum Read Depth': minPositionReads,
      'Permanent Link (Spike Only)': getPermanentLink(
        seqName,
        geneSeqs,
        patternsTo,
        gene => gene === 'S'
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

export default seqReadsSummary;
