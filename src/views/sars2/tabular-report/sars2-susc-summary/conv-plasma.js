import nestedGet from 'lodash/get';
import {
  buildPayload
} from '../../../../components/susc-summary/cp-susc-summary';


function formatFold(fold) {
  return fold >= 1000 ? '≥1000' : `${fold.toFixed(1)}`;
}


function joinMutations(mutations) {
  return mutations.map(({text}) => text).join(', ') || 'None';
}


function buildCPTable({
  seqName,
  itemsByVariantOrMutations,
  drdbLastUpdate
}) {
  const rows = [];
  for (const {
    mutations,
    numRefs,
    numSamples,
    medianFold,
    references,
    variant,
    ...cpData
  } of buildPayload(itemsByVariantOrMutations)) {
    const level1 = nestedGet(cpData, 'levels.susceptible');
    const level2 = nestedGet(cpData, 'levels.partial-resistance');
    const level3 = nestedGet(cpData, 'levels.resistant');
    const row = {
      'Sequence Name': seqName,
      'Gene': 'Spike',
      'Mutations': joinMutations(mutations),
      'Variant': variant ? variant.name : 'NA',
      '# Studies': numRefs,
      '# Samples': numSamples,
      '<3-Fold': (
        isNaN(level1) ?
          null : `${level1 * 100}%`
      ),
      '3-9-Fold': (
        isNaN(level2) ?
          null : `${level2 * 100}%`
      ),
      '≥10-Fold': (
        isNaN(level3) ?
          null : `${level3 * 100}%`
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
  drdbLastUpdate,
  sequenceReadsAnalysis,
  sequenceAnalysis
}) {
  const header = [
    'Sequence Name',
    'Gene',
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
    const itemsByVariantOrMutations = convPlasmaSuscSummary
      .itemsByVariantOrMutations
      .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
    const rows = buildCPTable({
      seqName,
      itemsByVariantOrMutations,
      drdbLastUpdate
    });
    tables.push({
      folder: 'susc-conv-plasma',
      tableName:
        'CPSuscSummary_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      header,
      rows
    });
  }
  return tables;
}

export default cpSuscSummary;
