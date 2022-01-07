import nestedGet from 'lodash/get';
import {
  getAntibodyColumns,
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
  itemsByVariantOrMutations,
  geneDisplay,
  drdbLastUpdate,
  antibodyColumns
}) {
  const rows = [];
  for (const {
    mutations,
    references,
    variant,
    ...abData
  } of buildPayload(itemsByVariantOrMutations)) {
    const shorten = shortenMutList(mutations);
    const row = {
      'Sequence Name': seqName,
      'Mutations': shorten.map(
        ({gene: {name}, text}) => (
          name === 'S' ? text : `${geneDisplay[name] || name}:${text}`
        )
      ),
      'Variant': variant ? variant.name : 'NA',
      'References': references.map(({DOI, URL}) => DOI || URL).join(' ; '),
      'Version': drdbLastUpdate
    };
    for (const abs of antibodyColumns) {
      const abText = abs
        .map(({name, abbrName}) => abbrName || name)
        .join('+');
      const item = nestedGet(abData, `fold.${
        abs.map(({name}) => name).join('+')
      }`);
      row[`Median Fold: ${abText}`] = extractFold(item);
      row[`# Results: ${abText}`] = extractCumuCount(item);
    }
    rows.push(row);
  }
  return rows;
}


function abSuscSummary({
  drdbLastUpdate,
  antibodies,
  sequenceReadsAnalysis,
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
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2,
      antibodySuscSummary
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const itemsByVariantOrMutations = antibodySuscSummary
      .itemsByVariantOrMutations
      .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
    const antibodyColumns = getAntibodyColumns(
      antibodies,
      itemsByVariantOrMutations
    );
    const header = [
      ...commonHeader,
      ...antibodyColumns.reduce(
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
      itemsByVariantOrMutations,
      geneDisplay,
      drdbLastUpdate,
      antibodyColumns
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
