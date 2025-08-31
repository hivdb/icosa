import React from 'react';
import SimpleTable, {ColumnDef} from '../../simple-table';
import '../../../styles/griddle-table.scss';

import ReportSection from '../report-section';
import DRCommentByTypes from '../dr-comment-by-types';
import type {DRComments} from '../dr-comment-by-types';

import {subtypeDisplayNames, geneToDrugClass} from './common';
import PrevalenceData from './prevalence-data';
import PrevalenceMutCol from './prevalence-mut-col';
import type {SubtypeStat, PrevalenceRow} from './types';
import style from './style.module.scss';

/**
 * Build column definitions for the prevalence table.
 *
 * @param subtypeStats - Statistics grouped by subtype.
 * @param gene - Current gene name.
 * @returns Array of column definitions.
 */
function useColumnDefs(subtypeStats: SubtypeStat[], gene: string) {
  return React.useMemo(
    () => {
      let colDefs: ColumnDef<any, PrevalenceRow>[] = [
        new ColumnDef<string, PrevalenceRow>({
          name: 'mutation',
          render: (mut, row) => (
            <PrevalenceMutCol mutation={mut} row={row} />
          ),
          sortable: false
        }),
        new ColumnDef<string, PrevalenceRow>({
          name: 'triplet',
          label: 'Codon',
          sortable: false,
          none: ''
        })
      ];

      for (const type of ['Naive', 'Treated']) {
        colDefs = colDefs.concat(subtypeStats.map(
          ({name, stats}) => {
            let colDef: ColumnDef<[string, number][], PrevalenceRow> | undefined;
            for (const stat of stats) {
              if (stat.gene.name !== gene) {
                continue;
              }
              const total = stat[`total${type}` as 'totalNaive' | 'totalTreated'];
              const display = subtypeDisplayNames[name] || name;
              colDef = new ColumnDef<[string, number][], PrevalenceRow>({
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
            return colDef!;
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
  subtypeStats: SubtypeStat[];
  mutationComments: DRComments;
  data: PrevalenceRow[];
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
    (curRow: PrevalenceRow) => {
      const {rowId, children, showChildren} = curRow;
      if (children) {
        let newDisplayData: PrevalenceRow[];
        if (showChildren) {
          newDisplayData = displayData.filter(
            ({parentRowId}) => parentRowId !== rowId
          );
        }
        else {
          newDisplayData = displayData.reduce<PrevalenceRow[]>(
            (acc, row) => {
              acc.push(row);
              if (row.rowId === rowId && row.children) {
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
     title={`Mutation percentage according to subtype and ${drugClass} treatment`}
     className={style['gene-mutation-prevalence']}
     data-drug-class={drugClass}>
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
