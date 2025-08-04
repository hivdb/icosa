import React from 'react';
import SimpleTable, {ColumnDef} from '../../simple-table';
import '../../../styles/griddle-table.scss';

import ReportSection from '../report-section';
import DRCommentByTypes from '../dr-comment-by-types';

import {subtypeDisplayNames, geneToDrugClass} from './common';
import PrevalenceData from './prevalence-data';
import PrevalenceMutCol from './prevalence-mut-col';
import style from './style.module.scss';

/**
 * Build column definitions for the prevalence table.
 *
 * @param subtypeStats - Statistics grouped by subtype.
 * @param gene - Current gene name.
 * @returns Array of column definitions.
 */
function useColumnDefs(subtypeStats: any[], gene: string) {
  return React.useMemo(
    () => {
      let colDefs: ColumnDef[] = [
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
            let colDef: ColumnDef | undefined;
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
            return colDef as ColumnDef;
          }
        ));
      }
      return colDefs;
    },
    [subtypeStats, gene]
  );
}

/**
 * Render mutation prevalence table for a gene.
 *
 * @param gene - Gene name.
 * @param subtypeStats - Subtype statistics.
 * @param mutationComments - Comments grouped by mutation type.
 * @param data - Table data rows.
 * @returns Report section with prevalence table and comments.
 */
export interface GeneMutationPrevalenceProps {
  gene: string;
  subtypeStats: any[];
  mutationComments: any;
  data: any[];
}

export default function GeneMutationPrevalence({
  gene,
  subtypeStats,
  mutationComments,
  data
}: GeneMutationPrevalenceProps) {
  const [displayData, setDisplayData] = React.useState(data);

  const colDefs = useColumnDefs(subtypeStats, gene);

  const handleRowClick = React.useCallback(
    (curRow) => {
      const {rowId, children, showChildren} = curRow;
      if (children) {
        let newDisplayData;
        if (showChildren) {
          newDisplayData = displayData.filter(
            ({parentRowId}) => parentRowId !== rowId
          );
        }
        else {
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
            [] as any[]
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
