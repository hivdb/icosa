import {
  findComboAntibodies,
  makeOrderedAntibodies,
  buildPayload
} from '../../../../components/susc-summary/ab-susc-summary';

import shortenMutList from '../../../../utils/shorten-mutation-list';


function extractFold(item) {
  if (!item) {
    return null;
  }
  const {
    cumulativeFold: {median}
  } = item;
  return median >= 100 ? '≥100' : `${median.toFixed(1)}`;
}


function extractCumuCount(item) {
  if (!item) {
    return null;
  }
  return item.cumulativeCount;
}


function buildAbTable({
  seqName,
  itemsByMutations,
  geneDisplay,
  drdbLastUpdate,
  orderedAntibodies
}) {
  const rows = [];
  for (const {
    mutations,
    references,
    isolates,
    ...abData
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
      'References': references.map(({DOI, URL}) => DOI || URL).join(' ; '),
      'Version': drdbLastUpdate
    };
    for (const abs of orderedAntibodies) {
      const abText = abs
        .map(({name, abbrName}) => abbrName || name)
        .join('+');
      const item = abData[`__abfold__${
        abs.map(({name}) => name).join('+')
      }`];
      row[`Median Fold: ${abText}`] = extractFold(item);
      row[`# Results: ${abText}`] = extractCumuCount(item);
    }
    rows.push(row);
  }
  return rows;
}


function abSuscSummary({
  currentProgramVersion,
  drdbLastUpdate,
  antibodies,
  sequenceAnalysis,
  config
}) {
  const {geneDisplay} = config;
  const commonHeader = [
    'Sequence Name',
    'Mutations',
    'Variant'
  ];
  const commonHeaderEnd = [
    'References',
    'Version'
  ];
  const tables = [];
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      antibodySuscSummary
    } = seqResult;
    const itemsByMutations = antibodySuscSummary.itemsByMutations
      .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
    const comboAntibodies = findComboAntibodies(itemsByMutations);
    const orderedAntibodies = makeOrderedAntibodies(
      antibodies, comboAntibodies
    );
    const header = [
      ...commonHeader,
      ...orderedAntibodies.reduce(
        (acc, abs) => {
          const abText = abs
            .map(({name, abbrName}) => abbrName || name)
            .join('+');
          acc.push(`Median Fold: ${abText}`);
          acc.push(`# Results: ${abText}`);
          return acc;
        },
        []
      ),
      ...commonHeaderEnd
    ];
    const rows = buildAbTable({
      seqName,
      itemsByMutations,
      geneDisplay,
      drdbLastUpdate,
      orderedAntibodies
    });
    tables.push({
      folder: 'susc-mab',
      tableName: 'MAbSuscSummary_' + seqName.replace(/[<>:"/\\|?*]/g, '_'),
      header,
      rows
    });
  }
  return tables;
}

export default abSuscSummary;
