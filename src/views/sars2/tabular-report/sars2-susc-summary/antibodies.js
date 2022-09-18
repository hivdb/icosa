import nestedGet from 'lodash/get';
import {
  getAntibodyColumns,
  buildPayload
} from '../../../../components/susc-summary/ab-susc-summary';


function extractFold(item) {
  if (!item) {
    return null;
  }
  const {
    cumulativeFold: {median}
  } = item;
  return median >= 1000 ? '≥1000' : `${median.toFixed(1)}`;
}


function extractCumuCount(item) {
  if (!item) {
    return null;
  }
  return item.cumulativeCount;
}


function joinMutations(mutations) {
  return mutations.map(({text}) => text).join(', ') || 'None';
}


function buildAbTable({
  seqName,
  itemsByVariantOrMutations,
  drdbLastUpdate,
  antibodyColumns
}) {
  const rows = [];
  for (const {
    mutations,
    references,
    variant,
    variantExtraMutations,
    variantMissingMutations,
    displayOrder,
    ...abData
  } of buildPayload(itemsByVariantOrMutations)) {
    const row = {
      'Sequence Name': seqName,
      'Gene': 'Spike',
      'Mutations': joinMutations(mutations),
      'Variant': variant ? variant.name : 'NA',
      'Additional Mutations':
        variant ? joinMutations(variantMissingMutations) : 'NA',
      'Missing Mutations':
        variant ? joinMutations(variantExtraMutations) : 'NA',
      'References': references.map(({DOI, URL}) => DOI || URL).join(' ; '),
      'Version': drdbLastUpdate,
      'Top Match': displayOrder === 0 ? 'Yes' : 'No'
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
  sequenceAnalysis
}) {
  const commonHeader = [
    'Sequence Name',
    'Gene',
    'Mutations',
    'Variant'
  ];
  const commonHeaderEnd = [
    'References',
    'Version',
    'Additional Mutations',
    'Missing Mutations',
    'Top Match'
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
      drdbLastUpdate,
      antibodyColumns
    });
    tables.push({
      folder: 'susc-mab',
      tableName:
        'MAbSuscSummary_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      header,
      rows
    });
  }
  return tables;
}

export default abSuscSummary;
