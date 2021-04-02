import React from 'react';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import ExtLink from '../link/external';
import SimpleTable, {ColumnDef} from '../simple-table';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';


function renderMutations(mutations) {
  const shortMutations = shortenMutationList(mutations);
  return (
    <div
     key={getRowKey({mutations})}
     className={style['cell-variants']}>
      <div className={style['mutations']}>
        {shortMutations.map(({text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}>+</span> : null}
            <span className={style['mutation']}>
              {text}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


function buildPayload(antibodySuscSummary) {
  return antibodySuscSummary.map(
    ({mutations, itemsByAntibody}) => {
      const row = {mutations};
      const refs = [];
      for (const {antibodies, items, ...cumdata} of itemsByAntibody) {
        const abkey = (
          '__abfold__' +
          sortBy(antibodies, ['priority'])
            .map(({name}) => name).join('+')
        );
        row[abkey] = cumdata;
        for (let {reference: {refName, DOI, URL}} of items) {
          if (DOI) {
            URL = `https://doi.org/${DOI}`;
          }
          refs.push({refName, URL});
        }
      }
      row.references = uniqWith(refs, isEqual);
      return row;
    }
  );
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


function renderRefs(refs) {
  return <ol className={style['cell-references']}>
    {refs.map(({refName, URL}) => <li name={refName}>
      <ExtLink href={URL}>{refName}</ExtLink>
    </li>)}
  </ol>;
}


function getRowKey({mutations}) {
  return mutations.map(({text}) => text).join('+');
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
      render: renderMutations,
      sort: [({mutations}) => [
        mutations.length,
        ...mutations.map(({position, AAs}) => [position, AAs])
      ]]
    }),
    ...orderedAntibodies.map(abs => new ColumnDef({
      name: '__abfold__' + abs.map(({name}) => name).join('+'),
      label: abs.map(({name, abbrName}) => abbrName || name).join(' + '),
      render: renderFold,
      sort: ['cumulativeFold.median']
    })),
    new ColumnDef({
      name: 'references',
      label: 'References',
      render: renderRefs,
      sortable: false
    })
  ];
  return colDefs;
}


function AntibodySuscSummary({
  antibodies,
  antibodySuscSummary,
  ...props
}) {
  antibodySuscSummary = antibodySuscSummary
    .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
  const payload = buildPayload(antibodySuscSummary);

  return <>
    <SimpleTable
     compact lastCompact
     getRowKey={getRowKey}
     columnDefs={buildColumnDefs(antibodies, antibodySuscSummary)}
     data={payload} />
  </>;
}


export default AntibodySuscSummary;
