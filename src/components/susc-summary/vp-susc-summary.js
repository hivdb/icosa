import React from 'react';

import Markdown from '../markdown';
import {ConfigContext} from '../report';
import SIRPcntBar from '../sir-pcnt-bar';
import SimpleTable, {ColumnDef} from '../simple-table';

import {getRowKey, getUniqVariants, decideDisplayPriority} from './funcs';
import CellMutations from './cell-mutations';
import CellReferences from './cell-references';
import useToggleDisplay from './toggle-display';
import style from './style.module.scss';


const SIRLevels = [
  'susceptible',
  'partial-resistance',
  'resistant'
];


function buildPayload(vaccPlasmaSuscSummary) {
  return decideDisplayPriority(vaccPlasmaSuscSummary)
    .map(
      ([{
        mutations,
        hitVariants,
        references,
        cumulativeCount: numSamples,
        cumulativeFold: {median: medianFold},
        itemsByResistLevel
      }, displayOrder]) => {
        const variants = getUniqVariants(hitVariants);
        const row = {
          mutations,
          variants,
          numRefs: references.length,
          numSamples,
          medianFold,
          references,
          displayOrder
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
    )
    .filter(({displayOrder}) => displayOrder !== null);
}

function renderPcnt(pcnt) {
  if (pcnt >= 0.005) {
    return `${(pcnt * 100).toFixed(0)}%`;
  }
  else {
    return '0';
  }
}

function renderPcntBar(_, row) {
  const {
    __level__susceptible: levelS = 0,
    '__level__partial-resistance': levelI = 0,
    __level__resistant: levelR = 0
  } = row;
  return <SIRPcntBar levelPcnts={[
    {level: '1', pcnt: levelS},
    {level: '2', pcnt: levelI},
    {level: '3', pcnt: levelR}
  ]} />;
}

function buildColumnDefs(itemsByMutations) {
  const colDefs = [
    new ColumnDef({
      name: 'mutations',
      label: 'Variant',
      render: (mutations, {variants}) => (
        <CellMutations {...{mutations, variants}} />
      ),
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
      render: refs => <CellReferences refs={refs} />,
      sortable: false
    })
  ];
  return colDefs;
}


function VaccPlasmaSuscSummary({
  vaccPlasmaSuscSummary: {itemsByMutations},
  ...props
}) {
  itemsByMutations = itemsByMutations
    .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
  const payload = buildPayload(itemsByMutations);
  const {rows, button, expanded} = useToggleDisplay(payload);

  if (payload.length > 0) {
    return (
      <SimpleTable
       cacheKey={expanded}
       compact lastCompact disableCopy
       className={style['susc-summary']}
       getRowKey={getRowKey}
       columnDefs={buildColumnDefs(itemsByMutations)}
       data={rows}
       afterTable={button} />
    );
  }
  else {
    return <ConfigContext.Consumer>
      {({messages}) => (
        <Markdown escapeHtml={false}>
          {messages['no-vp-susc-result']}
        </Markdown>
      )}
    </ConfigContext.Consumer>;
  }
}


export default React.memo(VaccPlasmaSuscSummary);
