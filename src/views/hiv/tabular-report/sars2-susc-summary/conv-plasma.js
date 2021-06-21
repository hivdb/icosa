import {
  buildPayload
} from '../../../../components/susc-summary/cp-susc-summary';

import shortenMutList from '../../../../utils/shorten-mutation-list';


function formatFold(fold) {
  return fold >= 100 ? '≥100' : `${fold.toFixed(1)}`;
}


function buildCPTable({
  seqName,
  itemsByMutations,
  geneDisplay,
  drdbLastUpdate
}) {
  const rows = [];
  for (const {
    mutations,
    numRefs,
    numSamples,
    medianFold,
    references,
    isolates,
    ...cpData
  } of buildPayload(itemsByMutations)) {
    const shorten = shortenMutList(mutations);
    const variant = isolates.join('/');
    const row = {
      'Sequence Name': seqName,
      'Mutations': shorten.map(
        ({gene: {name}, text}) => (
          name === 'S' ? text : `${geneDisplay[name] || name}:${text}`
        )
      ),
      'Variant': variant,
      '# Studies': numRefs,
      '# Samples': numSamples,
      '<3-Fold': (
        isNaN(cpData['__level__susceptible']) ?
          null : `${cpData['__level__susceptible'] * 100}%`
      ),
      '3-9-Fold': (
        isNaN(cpData['__level__partial-resistance']) ?
          null : `${cpData['__level__partial-resistance'] * 100}%`
      ),
      '≥10-Fold': (
        isNaN(cpData['__level__resistant']) ?
          null : `${cpData['__level__resistant'] * 100}%`
      ),
      'Median Fold': formatFold(medianFold),
      'References': references.map(({DOI, URL}) => DOI || URL).join(' ; '),
      'Version': drdbLastUpdate
    };
    rows.push(row);
  }
  return rows;
}


function cpSuscSummary({
  currentProgramVersion,
  drdbLastUpdate,
  sequenceReadsAnalysis,
  sequenceAnalysis,
  config
}) {
  const {geneDisplay} = config;
  const header = [
    'Sequence Name',
    'Mutations',
    'Variant',
    '# Studies',
    '# Samples',
    '<3-Fold',
    '3-9-Fold',
    '≥10-Fold',
    'Median Fold',
    'References',
    'Version'
  ];
  const tables = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2,
      convPlasmaSuscSummary
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const itemsByMutations = convPlasmaSuscSummary.itemsByMutations
      .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
    const rows = buildCPTable({
      seqName,
      itemsByMutations,
      geneDisplay,
      drdbLastUpdate
    });
    tables.push({
      folder: 'susc-conv-plasma',
      tableName: 'CPSuscSummary_' + seqName.replace(/[<>:"/\\|?*]/g, '_'),
      header,
      rows
    });
  }
  return tables;
}

export default cpSuscSummary;
