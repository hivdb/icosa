import React from 'react';

import Markdown from '../markdown';
import ExtLink from '../link/external';
import {ConfigContext} from '../report';
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


const SIRLevels = [
  'susceptible',
  'partial-resistance',
  'resistant'
];


function buildPayload(convPlasmaSuscSummary) {
  return convPlasmaSuscSummary.map(
    ({
      mutations,
      references,
      cumulativeCount: numSamples,
      itemsByResistLevel
    }) => {
      const row = {
        mutations,
        numRefs: references.length,
        numSamples,
        references
      };
      for (const {
        resistanceLevel,
        cumulativeCount
      } of itemsByResistLevel) {
        if (SIRLevels.includes(resistanceLevel)) {
          row[`__level__${resistanceLevel}`] = cumulativeCount / numSamples;
        }
        else {
          row[`__level__undetermined`] = row[`__level__undetermined`] || 0;
          row[`__level__undetermined`] += cumulativeCount / numSamples;
        }
      }
      return row;
    }
  );
}

function renderRefs(refs) {
  return <ol className={style['cell-references']}>
    {refs.map(({refName, DOI, URL}) => <li name={refName}>
      <ExtLink href={URL ? URL : `https://doi.org/${DOI}`}>
        {refName}
      </ExtLink>
    </li>)}
  </ol>;
}

function getRowKey({mutations}) {
  return mutations.map(({text}) => text).join('+');
}

function renderPcnt(pcnt) {
  if (pcnt >= 0.005) {
    return `${(pcnt * 100).toFixed(0)}%`;
  }
  else {
    return '0';
  }
}

function buildColumnDefs(itemsByKeyMutations) {
  const hasUndetermined = itemsByKeyMutations.some(
    ({itemsByResistLevel}) => itemsByResistLevel.some(
      ({resistanceLevel}) => !([
        'susceptible',
        'partial-resistance',
        'resistant'
      ].includes(resistanceLevel))
    )
  );
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
    new ColumnDef({
      name: 'numRefs',
      label: '# studies'
    }),
    new ColumnDef({
      name: 'numSamples',
      label: '# samples'
    }),
    new ColumnDef({
      name: '__level__susceptible',
      label: '<3-fold (S)',
      render: renderPcnt
    }),
    new ColumnDef({
      name: '__level__partial-resistance',
      label: '3-9-fold (I)',
      render: renderPcnt
    }),
    new ColumnDef({
      name: '__level__resistant',
      label: '≥10-fold (R)',
      render: renderPcnt
    }),
    ...(hasUndetermined ? [
      new ColumnDef({
        name: '__level__undetermined',
        label: 'No individual fold',
        render: renderPcnt
      })
    ] : []),
    new ColumnDef({
      name: 'references',
      label: 'References',
      render: renderRefs,
      sortable: false
    })
  ];
  return colDefs;
}


function ConvPlasmaSuscSummary({
  convPlasmaSuscSummary: {itemsByKeyMutations},
  ...props
}) {
  itemsByKeyMutations = itemsByKeyMutations
    .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
  const payload = buildPayload(itemsByKeyMutations);

  return <ConfigContext.Consumer>
    {({messages}) => (
      payload.length > 0 ?
        <SimpleTable
         compact lastCompact
         getRowKey={getRowKey}
         columnDefs={buildColumnDefs(itemsByKeyMutations)}
         data={payload} /> :
        <Markdown escapeHtml={false}>
          {messages['no-cp-susc-result']}
        </Markdown>
    )}
  </ConfigContext.Consumer>;
}


export default ConvPlasmaSuscSummary;
