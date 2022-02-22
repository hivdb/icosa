import React from 'react';
import PropTypes from 'prop-types';

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
import {
  antibodyShape,
  abSuscSummaryShape
} from './prop-types';
import style from './style.module.scss';


function renderFold(resultItem) {
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


function buildPayload(antibodySuscSummary) {
  let results = antibodySuscSummary
    .map(
      ({
        variant,
        mutations,
        variantExtraMutations,
        variantMissingMutations,
        references,
        itemsByAntibody,
        displayOrder
      }) => {
        const row = {
          mutations,
          references,
          variant,
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


function getAntibodyColumns(antibodies, antibodySuscSummary) {
  const comboAntibodies = findComboAntibodies(antibodySuscSummary);
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


function useColumnDefs({antibodyColumns, openRefInNewWindow}) {
  return React.useMemo(
    () => [
      new ColumnDef({
        name: 'mutations',
        label: 'Variant',
        render: (mutations, {variant}) => (
          <CellMutations {...{mutations, variant}} />
        ),
        bodyCellStyle: {
          '--desktop-max-width': '14rem'
        },
        sort: [({mutations}) => [
          mutations.length,
          ...mutations.map(({position, AAs}) => [position, AAs])
        ]]
      }),
      ...antibodyColumns.map(abs => new ColumnDef({
        name: 'fold.' + abs.map(({name}) => name).join('+'),
        label: <LabelAntibodies antibodies={abs} />,
        render: renderFold,
        sort: ['cumulativeFold.median']
      })),
      new ColumnDef({
        name: 'references',
        label: <LabelReferences />,
        render: refs => (
          <CellReferences {...{refs, openRefInNewWindow}} />
        ),
        sortable: false
      })
    ],
    [antibodyColumns, openRefInNewWindow]
  );
}


AntibodySuscSummaryTable.propTypes = {
  antibodyColumns: PropTypes.arrayOf(
    PropTypes.arrayOf(antibodyShape.isRequired).isRequired
  ).isRequired,
  rows: PropTypes.arrayOf(
    abSuscSummaryShape.isRequired
  ).isRequired,
  openRefInNewWindow: PropTypes.bool.isRequired
};

AntibodySuscSummaryTable.defaultProps = {
  openRefInNewWindow: false
};

function AntibodySuscSummaryTable({
  rows,
  antibodyColumns,
  openRefInNewWindow
}) {
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
          {config.messages['mab-footnote']}
        </Markdown>
      </div>}
    </>;
  }
  else {
    return loading ? null : (
      <Markdown escapeHtml={false}>
        {config.messages['no-mab-susc-result']}
      </Markdown>
    );
  }
}


AntibodySuscSummary.propTypes = {
  antibodies: PropTypes.array.isRequired,
  antibodySuscSummary: PropTypes.shape({
    itemsByVariantOrMutations: PropTypes.array.isRequired
  }).isRequired
};

function AntibodySuscSummary({
  antibodies,
  antibodySuscSummary: {itemsByVariantOrMutations}
}) {

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
