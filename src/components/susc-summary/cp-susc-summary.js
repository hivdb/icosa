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


export function buildPayload(convPlasmaSuscSummary) {
  return decideDisplayPriority(convPlasmaSuscSummary)
    .map(
      ([{
        mutations,
        hitIsolates,
        references,
        cumulativeCount: numSamples,
        cumulativeFold: {median: medianFold},
        itemsByResistLevel
      }, displayOrder]) => {
        const isolates = getUniqVariants(hitIsolates);
        const row = {
          mutations,
          isolates,
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
      render: (mutations, {isolates}) => (
        <CellMutations {...{mutations, isolates}} />
      ),
      bodyCellStyle: {
        maxWidth: '14rem'
      },
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
      label: 'Susceptibility distribution',
      render: renderPcntBar,
      sortable: false
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


function ConvPlasmaSuscSummary({
  convPlasmaSuscSummary: {itemsByMutations},
  ...props
}) {
  itemsByMutations = itemsByMutations
    .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
  const payload = buildPayload(itemsByMutations);
  const {rows, button, expanded} = useToggleDisplay(payload);

  if (payload.length > 0) {
    return <>
      <SimpleTable
       cacheKey={`${expanded}`}
       compact lastCompact disableCopy
       className={style['susc-summary']}
       getRowKey={getRowKey}
       columnDefs={buildColumnDefs(itemsByMutations)}
       data={rows}
       afterTable={button} />
      <p>
        Susceptibility levels:{' '}
        <span className={style['level-label']} data-level="1">
          &lt;3-fold
        </span>{' '}
        <span className={style['level-label']} data-level="2">
          3-9-fold
        </span>{' '}
        <span className={style['level-label']} data-level="3">
          ≥10-fold
        </span>{' '}
        <span className={style['level-label']} data-level="na">
          Aggregated data only
        </span>
      </p>
    </>;
  }
  else {
    return <ConfigContext.Consumer>
      {({messages}) => (
        <Markdown escapeHtml={false}>
          {messages['no-cp-susc-result']}
        </Markdown>
      )}
    </ConfigContext.Consumer>;
  }
}


export default React.memo(ConvPlasmaSuscSummary);
