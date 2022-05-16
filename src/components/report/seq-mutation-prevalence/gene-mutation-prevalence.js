import React from 'react';
import PropTypes from 'prop-types';
import SimpleTable, {ColumnDef} from '../../simple-table';
import '../../../styles/griddle-table.scss';

import ReportSection from '../report-section';
import DRCommentByTypes from '../dr-comment-by-types';

import {subtypeDisplayNames, geneToDrugClass} from './common';
import PrevalenceData from './prevalence-data';
import PrevalenceMutCol from './prevalence-mut-col';
import style from './style.module.scss';


function useColumnDefs(subtypeStats, gene) {
  return React.useMemo(
    () => {

      let colDefs = [
        new ColumnDef({
          name: 'mutation',
          render: (mut, row) => <PrevalenceMutCol mutation={mut} row={row} />,
          sortable: false
        }),
        new ColumnDef({
          name: 'triplet',
          label: 'Codon',
          sortable: false,
          none: ''
        })
      ];

      for (const type of ['Naive', 'Treated']) {
        colDefs = colDefs.concat(subtypeStats.map(
          ({name, stats}) => {
            let colDef;
            for (const stat of stats) {
              if (stat.gene.name !== gene) {
                continue;
              }
              const total = stat[`total${type}`];
              const display = subtypeDisplayNames[name] || name;
              colDef = new ColumnDef({
                name: `${type.toLowerCase()}${name}`,
                label: (
                  <span>
                    {display}<br />
                    <small>N={total}</small>
                  </span>
                ),
                render: (percents, row) => (
                  <PrevalenceData
                   gene={gene}
                   subtype={name}
                   rxType={type.toLowerCase()}
                   percents={percents}
                   row={row} />
                ),
                sortable: false
              });
            }
            return colDef;
          }
        ));
      }
      return colDefs;
    },
    [subtypeStats, gene]
  );
}


GeneMutationPrevalence.propTypes = {
  gene: PropTypes.string.isRequired,
  subtypeStats: PropTypes.array.isRequired,
  mutationComments: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired
};

export default function GeneMutationPrevalence({
  gene,
  subtypeStats,
  mutationComments,
  data
}) {
  const [displayData, setDisplayData] = React.useState(data);

  const colDefs = useColumnDefs(subtypeStats, gene);

  // static childContextTypes = {
  //   expandedRows: PropTypes.object,
  //   gene: PropTypes.string
  // };

  // constructor() {
  //   super(...arguments);
  //   this.expandedRows = new Set();
  // }

  // getChildContext() {
  //   const {expandedRows} = this;
  //   const {gene} = this.props;
  //   return {expandedRows, gene};
  // }

  const handleRowClick = React.useCallback(
    (curRow) => {
      const {rowId, children, showChildren} = curRow;
      if (children) {
        let newDisplayData;
        if (showChildren) {
          // collapse expanded children
          newDisplayData = displayData.filter(
            ({parentRowId}) => parentRowId !== rowId
          );
        }
        else {
          // expand children
          newDisplayData = displayData.reduce(
            (acc, row) => {
              acc.push(row);
              if (row.rowId === rowId) {
                for (const childRow of row.children) {
                  acc.push(childRow);
                }
              }
              return acc;
            },
            []
          );
        }
        curRow.showChildren = !showChildren;
        setDisplayData(newDisplayData);
      }
    },
    [displayData]
  );

  const drugClass = geneToDrugClass[gene];

  return (
    <ReportSection
     title={<>
       Mutation percentage according to subtype
       and {drugClass} treatment
     </>}
     className={style['gene-mutation-prevalence']}
     data-drug-class={drugClass}>
      <h2>
      </h2>
      <SimpleTable
       disableCopy
       className={style['gene-mutation-prevalence-table']}
       columnDefs={colDefs}
       data={displayData}
       onRowClick={handleRowClick} />
      <DRCommentByTypes
       {...mutationComments} />
    </ReportSection>
  );
}
