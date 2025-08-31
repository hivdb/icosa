import React from 'react';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import Markdown from '../markdown';
import SimpleTable, {ColumnDef} from '../simple-table';

import ConfigContext from '../../utils/config-context';

import {
  getRowKey,
  displayFold
} from './funcs';
import LabelAntibodies from './label-antibodies';
import CellMutations from './cell-mutations';
import CellReferences, {LabelReferences} from './cell-references';
import MismatchMutations from './mismatch-mutations';
import useToggleDisplay from './toggle-display';
import type {Antibody, AbSuscSummaryRow, Mutation, CumFold, Reference, AbSuscSummaryInput, AbSummaryByAntibodyEntry} from './types';
import style from './style.module.scss';

/**
 * Render the fold value for a given result item with styling based on level.
 *
 * @param resultItem - Fold information for an antibody combination
 * @returns JSX element showing the formatted fold
 */
function renderFold(resultItem?: CumFold) {
  if (!resultItem) {
    return <>-</>;
  }
  const {
    cumulativeFold: {median/*, p25, p75, min, max*/},
    cumulativeCount
  } = resultItem;
  const fold = displayFold(median);
  let level = 1;
  if (median >= 25) {
    level = 3;
  }
  else if (median >= 5) {
    level = 2;
  }
  return <div className={style['cell-fold']} data-level={level}>
    <div className={style['fold']}>
      {fold}<sub>{cumulativeCount}</sub>
    </div>
  </div>;
}

/**
 * Identify combinations of antibodies appearing in summary data.
 *
 * @param antibodySuscSummary - Summary data grouped by antibody
 * @returns Unique combinations of antibodies sorted by priority
 */
function findComboAntibodies(antibodySuscSummary: AbSuscSummaryInput[]): Antibody[][] {
  const combos: Antibody[][] = [];
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

/**
 * Build table payload from raw antibody susceptibility summary data.
 *
 * @param antibodySuscSummary - Raw summary grouped by variant or mutations
 * @returns Rows suitable for rendering in the table
 */
function buildPayload(antibodySuscSummary: AbSuscSummaryInput[]): AbSuscSummaryRow[] {
  let results = antibodySuscSummary
    .map(
      ({
        mutations,
        references,
        variant,
        variantMatchingMutations,
        variantExtraMutations,
        variantMissingMutations,
        itemsByAntibody,
        displayOrder
      }: AbSuscSummaryInput) => {
        const row: AbSuscSummaryRow = {
          mutations,
          references,
          variant,
          variantMatchingMutations,
          variantExtraMutations,
          variantMissingMutations,
          displayOrder,
          fold: {}
        };
        for (const {antibodies, ...cumdata} of itemsByAntibody) {
          const abkey = (
            sortBy(antibodies, ['priority'])
              .map(({name}) => name)
              .join('+')
          );
          row.fold[abkey] = cumdata;
        }
        return row;
      }
    )
    .filter(({displayOrder}) => displayOrder !== null);
  return results;
}

/**
 * Derive antibody column structure including combinations.
 *
 * @param antibodies - Input antibody list
 * @param antibodySuscSummary - Summary rows
 * @returns Ordered column definitions
 */
function getAntibodyColumns(antibodies: Antibody[], antibodySuscSummary: AbSuscSummaryInput[]): Antibody[][] {
  const comboAntibodies = findComboAntibodies(antibodySuscSummary);
  let columns: Antibody[][] = antibodies.map(({name, abbrName, priority}) => [
    {name, abbrName, priority}
  ]);
  columns = sortBy(columns, ['[0].priority']);
  for (const abs of comboAntibodies) {
    const maxAb = maxBy(abs, 'priority');
    const idx = columns.findIndex(a => (
      a[a.length - 1].name === maxAb!.name
    ));
    columns.splice(idx + 1, 0, abs);
  }
  return columns;
}

/** Build column definitions for antibody susceptibility table */
function useColumnDefs({antibodyColumns, openRefInNewWindow}: {antibodyColumns: Antibody[][]; openRefInNewWindow: boolean}) {
  return React.useMemo(
    () => [
      new ColumnDef<Mutation[], AbSuscSummaryRow>({
        name: 'mutations',
        label: 'Variant',
        render: (mutations, {variant}) => (
          <CellMutations {...{mutations, variant}} />
        ),
        bodyCellStyle: {
          '--desktop-max-width': '14rem'
        } as React.CSSProperties,
        sort: [({mutations}) => [
          mutations.length,
          ...mutations.map(({position, AAs}) => [position, AAs])
        ]]
      }),
      ...antibodyColumns.map(abs => new ColumnDef<CumFold, AbSuscSummaryRow>({
        name: 'fold.' + abs.map(({name}) => name).join('+'),
        label: <LabelAntibodies antibodies={abs} />,
        render: renderFold,
        sort: ['cumulativeFold.median']
      })),
      new ColumnDef<Reference[], AbSuscSummaryRow>({
        name: 'references',
        label: <LabelReferences />,
        render: (refs) => (
          <CellReferences {...{refs, openRefInNewWindow}} />
        ),
        sortable: false
      })
    ],
    [antibodyColumns, openRefInNewWindow]
  );
}

interface AntibodySuscSummaryTableProps {
  /** Data rows */
  rows: AbSuscSummaryRow[];
  /** Column definitions for antibodies */
  antibodyColumns: Antibody[][];
  /** Open references in new window */
  openRefInNewWindow?: boolean;
}

const AntibodySuscSummaryTable: React.FC<AntibodySuscSummaryTableProps> = ({
  rows,
  antibodyColumns,
  openRefInNewWindow = false
}) => {
  const columnDefs = useColumnDefs({antibodyColumns, openRefInNewWindow});
  const {rows: displayRows, button, expanded} = useToggleDisplay(rows);
  const [config, loading] = ConfigContext.use();

  if (rows.length > 0) {
    return <>
      <SimpleTable
       cacheKey={`${expanded}`}
       compact lastCompact disableCopy
       getRowKey={getRowKey}
       className={style['susc-summary']}
       columnDefs={columnDefs}
       data={displayRows}
       afterTable={button} />
      {loading ? null : <div className={style['susc-summary-footnote']}>
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
          </span>
        </p>
        <MismatchMutations rows={displayRows} />
        <Markdown escapeHtml={false}>
          {config?.messages['mab-footnote'] ?? ''}
        </Markdown>
      </div>}
    </>;
  }
  else {
    return loading ? null : (
      <Markdown escapeHtml={false}>
        {config?.messages['no-mab-susc-result'] ?? ''}
      </Markdown>
    );
  }
};

interface AntibodySuscSummaryProps {
  antibodies: Antibody[];
  antibodySuscSummary: {itemsByVariantOrMutations: AbSuscSummaryInput[]};
}

/**
 * High level component rendering antibody susceptibility summary table.
 *
 * @param props - {@link AntibodySuscSummaryProps}
 * @returns JSX element wrapping the summary table
 */
function AntibodySuscSummary({
  antibodies,
  antibodySuscSummary: {itemsByVariantOrMutations}
}: AntibodySuscSummaryProps) {

  itemsByVariantOrMutations = itemsByVariantOrMutations
    .filter(({itemsByAntibody}) => itemsByAntibody.length > 0);
  const antibodyColumns = React.useMemo(
    () => getAntibodyColumns(antibodies, itemsByVariantOrMutations),
    [antibodies, itemsByVariantOrMutations]
  );
  const payload = React.useMemo(
    () => buildPayload(itemsByVariantOrMutations),
    [itemsByVariantOrMutations]
  );

  return (
    <AntibodySuscSummaryTable
     rows={payload}
     antibodyColumns={antibodyColumns}
     openRefInNewWindow
    />
  );
}

export {
  buildPayload,
  useColumnDefs,
  getAntibodyColumns,
  AntibodySuscSummaryTable
};

export default React.memo(AntibodySuscSummary);
