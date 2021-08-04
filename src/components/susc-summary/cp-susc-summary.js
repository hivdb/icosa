import React from 'react';
import PropTypes from 'prop-types';

import Markdown from '../markdown';
import SIRPcntBar from '../sir-pcnt-bar';
import SimpleTable, {ColumnDef} from '../simple-table';

import ConfigContext from '../../utils/config-context';

import {cpSuscSummaryShape} from './prop-types';
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
        const variants = getUniqVariants(hitIsolates);
        const row = {
          mutations,
          variants,
          numRefs: references.length,
          numSamples,
          medianFold,
          references,
          displayOrder,
          levels: {}

        };
        for (const level of SIRLevels) {
          row.levels[level] = 0;
        }
        let total = 0;
        for (const {
          resistanceLevel,
          cumulativeCount
        } of itemsByResistLevel) {
          if (SIRLevels.includes(resistanceLevel)) {
            total += cumulativeCount;
            row.levels[resistanceLevel] = cumulativeCount;
          }
        }
        if (total > 0) {
          for (const level of SIRLevels) {
            row.levels[level] = row.levels[level] / total;
          }
        }
        return row;
      }
    )
    .filter(({displayOrder}) => displayOrder !== null);
}

function renderPcntBar(_, row) {
  const {
    levels: {
      susceptible: levelS = 0,
      'partial-resistance': levelI = 0,
      resistant: levelR = 0
    }
  } = row;
  return <SIRPcntBar levelPcnts={[
    {level: '1', pcnt: levelS},
    {level: '2', pcnt: levelI},
    {level: '3', pcnt: levelR}
  ]} />;
}

function useColumnDefs() {
  const colDefs = [
    new ColumnDef({
      name: 'mutations',
      label: 'Variant',
      render: (mutations, {variants}) => (
        <CellMutations {...{mutations, variants}} />
      ),
      bodyCellStyle: {
        '--desktop-max-width': '14rem'
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
      name: 'levels.susceptible',
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


function ConvPlasmaSuscSummaryTable({
  rows,
  openRefInNewWindow = false
}) {
  const {rows: displayRows, button, expanded} = useToggleDisplay(rows);
  const columnDefs = useColumnDefs();

  if (rows.length > 0) {
    return <>
      <SimpleTable
       cacheKey={`${expanded}`}
       compact lastCompact disableCopy
       className={style['susc-summary']}
       getRowKey={getRowKey}
       columnDefs={columnDefs}
       data={displayRows}
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


ConvPlasmaSuscSummaryTable.propTypes = {
  rows: PropTypes.arrayOf(
    cpSuscSummaryShape.isRequired
  ).isRequired,
  openRefInNewWindow: PropTypes.bool.isRequired
};


ConvPlasmaSuscSummaryTable.defaultProps = {
  openRefInNewWindow: false
};


function ConvPlasmaSuscSummary({
  convPlasmaSuscSummary: {itemsByMutations},
  ...props
}) {
  itemsByMutations = itemsByMutations
    .filter(({itemsByResistLevel}) => itemsByResistLevel.length > 0);
  const payload = buildPayload(itemsByMutations);

  return (
    <ConvPlasmaSuscSummaryTable
     rows={payload}
     openRefInNewWindow />
  );
}


export default React.memo(ConvPlasmaSuscSummary);
