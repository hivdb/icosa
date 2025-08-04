import React from 'react';

import Markdown from '../markdown';
import SIRPcntBar from '../sir-pcnt-bar';
import SimpleTable, {ColumnDef} from '../simple-table';

import ConfigContext from '../../utils/config-context';

import {
  getRowKey,
  displayFold
} from './funcs';
import CellMutations from './cell-mutations';
import CellReferences, {LabelReferences} from './cell-references';
import useToggleDisplay from './toggle-display';
import type {CpSuscSummaryRow} from './types';
import style from './style.module.scss';

const SIRLevels = [
  'susceptible',
  'partial-resistance',
  'resistant'
];

/**
 * Build table rows for convalescent plasma susceptibility summary.
 *
 * @param convPlasmaSuscSummary - Raw summary data
 * @returns Array of row objects
 */
export function buildPayload(convPlasmaSuscSummary: any[]): CpSuscSummaryRow[] {
  return convPlasmaSuscSummary
    .map(
      ({
        variant,
        mutations,
        references,
        cumulativeCount: numSamples,
        cumulativeFold: {median: medianFold},
        itemsByResistLevel,
        displayOrder
      }: any) => {
        const row: CpSuscSummaryRow = {
          variant,
          mutations,
          numRefs: references.length,
          numSamples,
          medianFold,
          references,
          displayOrder,
          levels: {},
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
    .filter(({displayOrder}) => displayOrder !== null);
}

function renderPcntBar(_: unknown, row: CpSuscSummaryRow) {
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
    () => ([
      new ColumnDef({
        name: 'mutations',
        label: 'Variant',
        render: (mutations: any, {variant}: any) => (
          <CellMutations {...{mutations, variant}} />
        ),
        bodyCellStyle: {
          '--desktop-max-width': '14rem'
        },
        sort: [({mutations}: any) => [
          mutations.length,
          ...mutations.map(({position, AAs}: any) => [position, AAs])
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
        render: displayFold
      }),
      new ColumnDef({
        name: 'references',
        label: <LabelReferences />,
        render: (refs: any) => (
          <CellReferences {...{refs, openRefInNewWindow}} />
        ),
        sortable: false
      })
    ]),
    [openRefInNewWindow]
  );
}

interface ConvPlasmaSuscSummaryTableProps {
  rows: CpSuscSummaryRow[];
  openRefInNewWindow?: boolean;
}

const ConvPlasmaSuscSummaryTable: React.FC<ConvPlasmaSuscSummaryTableProps> = ({rows, openRefInNewWindow = false}) => {
  const {rows: displayRows, button, expanded} = useToggleDisplay(rows);
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
          {messages['no-cp-susc-result']}
        </Markdown>
      )}
    </ConfigContext.Consumer>;
  }
};

interface ConvPlasmaSuscSummaryProps {
  convPlasmaSuscSummary: {itemsByVariantOrMutations: any[]};
}

function ConvPlasmaSuscSummary({
  convPlasmaSuscSummary: {itemsByVariantOrMutations}
}: ConvPlasmaSuscSummaryProps) {

  itemsByVariantOrMutations = itemsByVariantOrMutations
    .filter(({itemsByResistLevel}: any) => itemsByResistLevel.length > 0);
  const payload = buildPayload(itemsByVariantOrMutations);

  return (
    <ConvPlasmaSuscSummaryTable
     rows={payload}
     openRefInNewWindow />
  );
}

export default React.memo(ConvPlasmaSuscSummary);

