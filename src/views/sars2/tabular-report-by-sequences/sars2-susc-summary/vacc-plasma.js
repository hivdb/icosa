import {
  buildPayload
} from '../../../../components/susc-summary/vp-susc-summary';

import shortenMutList from '../../../../utils/shorten-mutation-list';


function formatFold(fold) {
  return fold >= 100 ? '≥100' : `${fold.toFixed(1)}`;
}


function buildVPTable({
  seqName,
  itemsByMutations,
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
    isolates,
    ...vpData
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
      'Vaccine': vaccineName,
      '# Studies': numRefs,
      '# Samples': numSamples,
      '<3-Fold': (
        isNaN(vpData['__level__susceptible']) ?
          null : `${vpData['__level__susceptible'] * 100}%`
      ),
      '3-9-Fold': (
        isNaN(vpData['__level__partial-resistance']) ?
          null : `${vpData['__level__partial-resistance'] * 100}%`
      ),
      '≥10-Fold': (
        isNaN(vpData['__level__resistant']) ?
          null : `${vpData['__level__resistant'] * 100}%`
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
  currentProgramVersion,
  drdbLastUpdate,
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
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      vaccPlasmaSuscSummary
    } = seqResult;
    const itemsByMutations = vaccPlasmaSuscSummary.itemsByMutations
      .filter(({itemsByVaccine}) => itemsByVaccine.length > 0);
    const rows = buildVPTable({
      seqName,
      itemsByMutations,
      geneDisplay,
      drdbLastUpdate
    });
    tables.push({
      folder: 'susc-vacc-plasma',
      tableName: 'VPSuscSummary_' + seqName.replace(/[<>:"/\\|?*]/g, '_'),
      header,
      rows
    });
  }
  return tables;
}

export default vpSuscSummary;
