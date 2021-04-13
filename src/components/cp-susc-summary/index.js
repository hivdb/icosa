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
      cumulativeFold: {median: medianFold},
      itemsByResistLevel
    }) => {
      const row = {
        mutations,
        numRefs: references.length,
        numSamples,
        medianFold,
        references
      };
      for (const level of SIRLevels) {
        row[`__level__${level}`] = 0;
      }
      let total = 0;
      for (const {
        resistanceLevel,
        cumulativeCount
      } of itemsByResistLevel) {
        if (SIRLevels.includes(resistanceLevel)) {
          total += cumulativeCount;
          row[`__level__${resistanceLevel}`] = cumulativeCount;
        }
      }
      if (total > 0) {
        for (const level of SIRLevels) {
          row[`__level__${level}`] = row[`__level__${level}`] / total;
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


function PcntBarItem({level, pcnt}) {
  const displayPcnt = pcnt >= 0.005 ? `${(pcnt * 100).toFixed(0)}%` : '0';
  return (
    <li
     data-level={level}
     data-pcnt={pcnt}
     title={displayPcnt}
     style={{'--level-pcnt': pcnt}}>
      <span className={style.pcnt}>
        {displayPcnt}
      </span>
    </li>
  );
}


function PcntBar({levelPcnts}) {
  const isEmpty = levelPcnts.every(({pcnt}) => pcnt === 0);
  return <ul className={style['pcnt-bar']}>
    {levelPcnts.map(({level, pcnt}) => (
      <PcntBarItem key={level} level={level} pcnt={pcnt} />
    ))}
    {isEmpty ? <li>N/A</li> : null}
  </ul>;
}


function renderPcntBar(_, row) {
  const {
    __level__susceptible: levelS = 0,
    '__level__partial-resistance': levelI = 0,
    __level__resistant: levelR = 0,
    __level__undetermined: levelU = 0
  } = row;
  return <PcntBar levelPcnts={[
    {level: '1', pcnt: levelS},
    {level: '2', pcnt: levelI},
    {level: '3', pcnt: levelR},
    {level: 'U', pcnt: levelU}
  ]} />;
}

function buildColumnDefs(itemsByKeyMutations) {
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
      label: <span className={style['level-label']} data-level="1">
        &lt;3-fold (S)
      </span>,
      render: renderPcntBar,
      bodyCellColSpan: 3
    }),
    new ColumnDef({
      name: '__level__partial-resistance',
      label: <span className={style['level-label']} data-level="2">
        3-9-fold (I)
      </span>,
      render: renderPcnt,
      bodyCellStyle: {
        display: 'none'
      }
    }),
    new ColumnDef({
      name: '__level__resistant',
      label: <span className={style['level-label']} data-level="3">
        ≥10-fold (R)
      </span>,
      render: renderPcnt,
      bodyCellStyle: {
        display: 'none'
      }
    }),
    new ColumnDef({
      name: 'medianFold',
      label: 'Median Fold',
      render: n => n.toFixed(1)
    }),
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
