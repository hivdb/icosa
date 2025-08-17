import React from 'react';

import Markdown from '../markdown';
import SIRPcntBar from '../sir-pcnt-bar';
import SimpleTable, {ColumnDef} from '../simple-table';

import ConfigContext from '../../utils/config-context';

import {
  getRowKey,
  displayFold
} from './funcs';
import type {VpSuscSummaryRow} from './types';
import CellMutations from './cell-mutations';
import CellReferences, {LabelReferences} from './cell-references';
import useToggleDisplay from './toggle-display';
import style from './style.module.scss';

const SIRLevels = [
  'susceptible',
  'partial-resistance',
  'resistant'
];

function buildPayload(vaccPlasmaSuscSummary: any[]): VpSuscSummaryRow[] {
  return vaccPlasmaSuscSummary
    .reduce(
      (acc: VpSuscSummaryRow[], {
        variant,
        mutations,
        itemsByVaccine,
        displayOrder
      }: any) => [
        ...acc,
        ...itemsByVaccine.map(
          ({
            vaccineName,
            references,
            cumulativeCount: numSamples,
            cumulativeFold: {median: medianFold},
            itemsByResistLevel
          }: any) => {
            const row: VpSuscSummaryRow = {
              variant,
              mutations,
              vaccineName,
              numRefs: references.length,
              numSamples,
              medianFold,
              references,
              displayOrder,
              levels: {}
            } as any;
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
      [] as VpSuscSummaryRow[]
      )
      .filter((row: VpSuscSummaryRow) => row.displayOrder !== null);
}

function renderPcntBar(_: unknown, row: VpSuscSummaryRow) {
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

function useColumnDefs({openRefInNewWindow}: {openRefInNewWindow: boolean}) {
  return React.useMemo(
    () => [
      new ColumnDef({
        name: 'mutations',
        label: 'Variant',
        render: (mutations: any, {variant}: any) => (
          <CellMutations {...{mutations, variant}} />
        ),
          bodyCellStyle: {
            '--desktop-max-width': '14rem'
          } as React.CSSProperties,
        sort: [({mutations}: any) => [
          mutations.length,
          ...mutations.map(({position, AAs}: any) => [position, AAs])
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
        render: displayFold,
        multiCells: true
      }),
      new ColumnDef({
        name: 'references',
        label: <LabelReferences />,
        render: (refs: any) => <CellReferences {...{refs, openRefInNewWindow}} />,
        multiCells: true,
        sortable: false
      })
    ],
    [openRefInNewWindow]
  );
}

interface VaccPlasmaSuscSummaryTableProps {
  rows: VpSuscSummaryRow[];
  openRefInNewWindow?: boolean;
}

const VaccPlasmaSuscSummaryTable: React.FC<VaccPlasmaSuscSummaryTableProps> = ({rows, openRefInNewWindow = false}) => {
    const normalizedRows = rows.map(row => ({
      ...row,
      displayOrder: row.displayOrder ?? 0
    }));
    const {rows: displayRows, button, expanded} = useToggleDisplay(normalizedRows);
  const columnDefs = useColumnDefs({openRefInNewWindow});

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
          &lt;5-fold
        </span>{' '}
        <span className={style['level-label']} data-level="2">
          5-to-24-fold
        </span>{' '}
        <span className={style['level-label']} data-level="3">
          ≥25-fold
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
};

interface VaccPlasmaSuscSummaryProps {
  vaccPlasmaSuscSummary: {itemsByVariantOrMutations: any[]};
}

function VaccPlasmaSuscSummary({
  vaccPlasmaSuscSummary: {
    itemsByVariantOrMutations
  }
}: VaccPlasmaSuscSummaryProps) {
  itemsByVariantOrMutations = itemsByVariantOrMutations
    .filter(({itemsByVaccine}: any) => itemsByVaccine.length > 0);
  const payload = buildPayload(itemsByVariantOrMutations);

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

