import React from 'react';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import Markdown from '../markdown';
import {ConfigContext} from '../report';
import SimpleTable, {ColumnDef} from '../simple-table';

import {getUniqVariants, getRowKey, decideDisplayPriority} from './funcs';
import LabelAntibodies from './label-antibodies';
import CellMutations from './cell-mutations';
import CellReferences from './cell-references';
import useToggleDisplay from './toggle-display';
import style from './style.module.scss';


function buildPayload(antibodySuscSummary) {
  return decideDisplayPriority(antibodySuscSummary)
    .map(
      ([{
        mutations,
        hitVariants,
        references,
        itemsByAntibody
      }, displayOrder]) => {
        const variants = getUniqVariants(hitVariants);
        const row = {mutations, references, variants, displayOrder};
        for (const {antibodies, items, ...cumdata} of itemsByAntibody) {
          const abkey = (
            '__abfold__' +
            sortBy(antibodies, ['priority'])
              .map(({name}) => name).join('+')
          );
          row[abkey] = cumdata;
        }
        return row;
      }
    )
    .filter(({displayOrder}) => displayOrder !== null);
}


function renderFold(resultItem) {
  if (!resultItem) {
    return <>-</>;
  }
  const {
    cumulativeFold: {median/*, p25, p75, min, max*/},
    cumulativeCount
  } = resultItem;
  const fold = median >= 100 ? '≥100' : `${median.toFixed(1)}`;
  let level = 1;
  if (median >= 10) {
    level = 3;
  }
  else if (median >= 3) {
    level = 2;
  }
  return <div className={style['cell-fold']} data-level={level}>
    <div className={style['fold']}>
      {fold}<sub>{cumulativeCount}</sub>
    </div>
    {/*<div className={style['iqr']}>
      {p25.toFixed(1)}-{p75.toFixed(1)}
    </div>
    <div className={style['range']}>
      {min.toFixed(1)}-{max.toFixed(1)}
    </div>*/}
  </div>;
}


function findComboAntibodies(antibodySuscSummary) {
  const combos = [];
  for (const {itemsByAntibody} of antibodySuscSummary) {
    for (const {antibodies} of itemsByAntibody) {
      if (antibodies.length > 1) {
        combos.push(sortBy(
          antibodies.map(({name, abbrName, priority}) => ({
            name, abbrName, priority
          })),
          ['priority']
        ));
      }
    }
  }
  return sortBy(uniqWith(combos, isEqual), ['[0].priority']);
}


function makeOrderedAntibodies(antibodies, comboAntibodies) {
  antibodies = antibodies.map(({name, abbrName, priority}) => [
    {name, abbrName, priority}
  ]);
  antibodies = sortBy(antibodies, ['[0].priority']);
  for (const abs of comboAntibodies) {
    const maxAb = maxBy(abs, 'priority');
    const idx = antibodies.findIndex(abs => (
      abs[abs.length - 1].name === maxAb.name
    ));
    antibodies.splice(idx + 1, 0, abs);
  }
  return antibodies;
}


function buildColumnDefs(antibodies, antibodySuscSummary) {
  const comboAntibodies = findComboAntibodies(antibodySuscSummary);
  const orderedAntibodies = makeOrderedAntibodies(antibodies, comboAntibodies);
  const colDefs = [
    new ColumnDef({
      name: 'mutations',
      label: 'Variant',
      render: (mutations, {variants}) => (
        <CellMutations {...{mutations, variants}} />
      ),
      bodyCellStyle: {
        maxWidth: '14rem'
      },
      sort: [({mutations}) => [
        mutations.length,
        ...mutations.map(({position, AAs}) => [position, AAs])
      ]]
    }),
    ...orderedAntibodies.map(abs => new ColumnDef({
      name: '__abfold__' + abs.map(({name}) => name).join('+'),
      label: <LabelAntibodies antibodies={abs} />,
      render: renderFold,
      sort: ['cumulativeFold.median']
    })),
    new ColumnDef({
      name: 'references',
      label: 'References',
      render: refs => <CellReferences refs={refs} />,
      sortable: false
    })
  ];
  return colDefs;
}


function AntibodySuscSummary({
  antibodies,
  antibodySuscSummary: {itemsByMutations},
  ...props
}) {
  itemsByMutations = itemsByMutations
    .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
  const payload = buildPayload(itemsByMutations);
  const {rows, button, expanded} = useToggleDisplay(payload);

  if (payload.length > 0) {
    return (
      <SimpleTable
       cacheKey={`${expanded}`}
       compact lastCompact disableCopy
       getRowKey={getRowKey}
       className={style['susc-summary']}
       columnDefs={buildColumnDefs(antibodies, itemsByMutations)}
       data={rows}
       afterTable={button} />
    );
  }
  else {
    return <ConfigContext.Consumer>
      {({messages}) => (
        <Markdown escapeHtml={false}>
          {messages['no-mab-susc-result']}
        </Markdown>
      )}
    </ConfigContext.Consumer>;
  }
}


export default React.memo(AntibodySuscSummary);
