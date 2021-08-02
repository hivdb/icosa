import React from 'react';
import PropTypes from 'prop-types';

import Markdown from '../markdown';
import SIRPcntBar from '../sir-pcnt-bar';
import SimpleTable, {ColumnDef} from '../simple-table';

import ConfigContext from '../../utils/config-context';

import {getRowKey, getUniqVariants, decideDisplayPriority} from './funcs';
import {vpSuscSummaryShape} from './prop-types';
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
    .reduce(
      (acc, [{
        mutations,
        hitIsolates,
        itemsByVaccine
      }, displayOrder]) => [
        ...acc,
        ...itemsByVaccine.map(
          ({
            vaccineName,
            references,
            cumulativeCount: numSamples,
            cumulativeFold: {median: medianFold},
            itemsByResistLevel
          }) => {
            const variants = getUniqVariants(hitIsolates);
            const row = {
              mutations,
              vaccineName,
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
      ],
      []
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
  return React.useMemo(
    () => [
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
      new ColumnDef({
        name: 'vaccineName',
        label: 'Vaccine'
      }),
      new ColumnDef({
        name: 'numRefs',
        label: '# studies',
        multiCells: true
      }),
      new ColumnDef({
        name: 'numSamples',
        label: '# samples',
        multiCells: true
      }),
      new ColumnDef({
        name: 'levels.susceptible',
        label: 'Susceptibility distribution',
        render: renderPcntBar,
        multiCells: true,
        sortable: false
      }),
      new ColumnDef({
        name: 'medianFold',
        label: 'Median Fold',
        render: n => n.toFixed(1),
        multiCells: true
      }),
      new ColumnDef({
        name: 'references',
        label: 'References',
        render: refs => <CellReferences refs={refs} />,
        multiCells: true,
        sortable: false
      })
    ],
    []
  );
}


function VaccPlasmaSuscSummaryTable({
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
          {messages['no-vp-susc-result']}
        </Markdown>
      )}
    </ConfigContext.Consumer>;
  }
}


VaccPlasmaSuscSummaryTable.propTypes = {
  rows: PropTypes.arrayOf(
    vpSuscSummaryShape.isRequired
  ).isRequired,
  openRefInNewWindow: PropTypes.bool.isRequired
};

VaccPlasmaSuscSummaryTable.defaultProps = {
  openRefInNewWindow: false
};


function VaccPlasmaSuscSummary({
  vaccPlasmaSuscSummary: {itemsByMutations},
  ...props
}) {
  itemsByMutations = itemsByMutations
    .filter(({itemsByVaccine}) => itemsByVaccine.length > 0);
  const payload = buildPayload(itemsByMutations);

  return (
    <VaccPlasmaSuscSummaryTable
     rows={payload}
     openRefInNewWindow />
  );
}


export {
  buildPayload,
  useColumnDefs,
  VaccPlasmaSuscSummaryTable
};

export default React.memo(VaccPlasmaSuscSummary);
