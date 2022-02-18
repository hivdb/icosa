import nestedGet from 'lodash/get';

import {
  buildPayload
} from '../../../../components/susc-summary/vp-susc-summary';

import shortenMutList from '../../../../utils/shorten-mutation-list';


function formatFold(fold) {
  return fold >= 1000 ? '≥1000' : `${fold.toFixed(1)}`;
}


function buildVPTable({
  seqName,
  itemsByVariantOrMutations,
  geneDisplay,
  drdbLastUpdate
}) {
  const rows = [];
  for (const {
    mutations,
    vaccineName,
    numRefs,
    numSamples,
    medianFold,
    references,
    variant,
    ...vpData
  } of buildPayload(itemsByVariantOrMutations)) {
    const shorten = shortenMutList(mutations);
    const level1 = nestedGet(vpData, 'levels.susceptible');
    const level2 = nestedGet(vpData, 'levels.partial-resistance');
    const level3 = nestedGet(vpData, 'levels.resistant');
    const row = {
      'Sequence Name': seqName,
      'Mutations': shorten.map(
        ({gene: {name}, text}) => (
          name === 'S' ? text : `${geneDisplay[name] || name}:${text}`
        )
      ),
      'Variant': variant ? variant.name : 'NA',
      'Vaccine': vaccineName,
      '# Studies': numRefs,
      '# Samples': numSamples,
      '<3-Fold': (
        isNaN(level1) ? null : `${level1 * 100}%`
      ),
      '3-9-Fold': (
        isNaN(level2) ? null : `${level2 * 100}%`
      ),
      '≥10-Fold': (
        isNaN(level3) ? null : `${level3 * 100}%`
      ),
      'Median Fold': formatFold(medianFold),
      'References': references.map(({DOI, URL}) => DOI || URL).join(' ; '),
      'Version': drdbLastUpdate
    };
    rows.push(row);
  }
  return rows;
}


function vpSuscSummary({
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
    'Vaccine',
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
      vaccPlasmaSuscSummary
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const itemsByVariantOrMutations = vaccPlasmaSuscSummary
      .itemsByVariantOrMutations
      .filter(({itemsByVaccine}) => itemsByVaccine.length > 0);
    const rows = buildVPTable({
      seqName,
      itemsByVariantOrMutations,
      geneDisplay,
      drdbLastUpdate
    });
    tables.push({
      folder: 'susc-vacc-plasma',
      tableName:
        'VPSuscSummary_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      header,
      rows
    });
  }
  return tables;
}

export default vpSuscSummary;
