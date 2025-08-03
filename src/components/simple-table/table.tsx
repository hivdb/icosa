import React from 'react';
import classNames from 'classnames';

import Loader from '../loader';

import style from './style.module.scss';
import useRowSpanMatrix from './use-rowspan-matrix';
import useSortState from './use-sort-state';
import CellTh from './cell-th';
import CellTd from './cell-td';
import type ColumnDef from './column-def';
import type {SortState} from './types';

interface Props {
  data: any[];
  onRowClick?: (row: any, idx: number, e: React.MouseEvent<HTMLTableRowElement>) => void;
  onBeforeSort?: (state: SortState) => void;
  onSort?: (state: SortState) => void;
  columnDefs: ColumnDef[];
  color?: string;
  getRowKey?: (row: any) => string | number | null;
  className?: string;
  tableStyle?: React.CSSProperties;
  enableRowSpan?: boolean;
}

/**
 * Render the inner table of {@link SimpleTable}.
 */
export default function SimpleTableTable({
  data,
  onRowClick,
  onBeforeSort,
  onSort,
  columnDefs,
  color,
  getRowKey = () => null,
  className,
  tableStyle = {},
  enableRowSpan = true
}: Props) {

  const [
    sortState,
    setSortState
  ] = useSortState(data);

  const handleSort = React.useCallback(
    (sortState: SortState) => {
      setSortState(sortState);
      onSort && onSort(sortState);
    },
    [setSortState, onSort]
  );

  const rowSpanMatrix = useRowSpanMatrix({
    columnDefs, data: sortState.sortedData
  });

  return React.useMemo(
    () => {
      const context = columnDefs.reduce<Record<string, any>>((acc, {name}) => {
        acc[name] = {};
        return acc;
      }, {});

      return (
        <table
         style={tableStyle}
         data-color={color}
         className={classNames(
           style['simple-table'],
           className
         )}>
          <thead>
            <tr>
              {columnDefs.map((columnDef, idx) => (
                <CellTh
                 key={idx}
                 data={data}
                 columnDef={columnDef}
                 sortState={sortState}
                 onBeforeSort={onBeforeSort}
                 onSort={handleSort} />
              ))}
            </tr>
            <tr data-skip-copy className={style['loader-container']}>
              <th colSpan={columnDefs.length}>
                <Loader />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortState.sortedData.map((row, idx) => (
              <tr
               key={getRowKey(row) || idx}
               onClick={onRowClick ? e => onRowClick(row, idx, e) : undefined}
               data-payload={JSON.stringify(row)}>
                {columnDefs.map((columnDef, jdx) => (
                  <CellTd
                   key={jdx}
                   row={row}
                   rowSpan={rowSpanMatrix[idx][jdx]}
                   rowContext={context[columnDef.name]}
                   columnDef={columnDef}
                   enableRowSpan={enableRowSpan} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
    [
      data,
      onRowClick,
      onBeforeSort,
      handleSort,
      sortState,
      columnDefs,
      color,
      getRowKey,
      className,
      tableStyle,
      enableRowSpan,
      rowSpanMatrix
    ]
  );

}
