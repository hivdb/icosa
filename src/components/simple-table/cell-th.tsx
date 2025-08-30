import React from 'react';
import sleep from 'sleep-promise';
import {FaSortDown} from '@react-icons/all-files/fa/FaSortDown';
import {FaSortUp} from '@react-icons/all-files/fa/FaSortUp';
import {FaSort} from '@react-icons/all-files/fa/FaSort';

import style from './style.module.scss';
import nestedGet from 'lodash/get';
import type {SortState, SortColumn, RowRecord} from './types';
import type ColumnDef from './column-def';

function getNextDirection(direction: 'ascending' | 'descending' | null) {
  if (direction === null) {
    return 'ascending';
  }
  else if (direction === 'ascending') {
    return 'descending';
  }
  else {
    return null;
  }
}

function moveNullsLast(data: RowRecord[], name: string) {
  const nonNulls: RowRecord[] = [];
  const nulls: RowRecord[] = [];
  for (const item of data) {
    const value = nestedGet(item as object, name);
    if (value === undefined || value === null || value === '') {
      nulls.push(item);
    }
    else {
      nonNulls.push(item);
    }
  }
  return [...nonNulls, ...nulls];
}

function applySorts(data: RowRecord[], columns: SortColumn[]) {
  let sortedData = [...data];
  for (let idx = columns.length - 1; idx > -1; idx --) {
    const {name, sort, direction, nullsLast} = columns[idx];
    if (direction === 'descending') {
      const prevCol = columns.find((col, jdx) => col.direction && jdx > idx);
      if (prevCol) {
        // if current direction is descending, reverse before the sorting
        // to preserve previous sorting order
        sortedData.reverse();
        if (prevCol.nullsLast) {
          sortedData = moveNullsLast(sortedData, prevCol.name);
        }
      }
    }
    if (direction) {
      sortedData = sort(sortedData, name);
      if (direction === 'descending') {
        sortedData.reverse();
      }
      if (nullsLast) {
        sortedData = moveNullsLast(sortedData, name);
      }
    }
  }
  return sortedData;
}

interface SimpleTableCellThProps {
  data: RowRecord[];
  columnDef: ColumnDef;
  sortState: SortState;
  onBeforeSort?: (arg: SortState) => void;
  onSort?: (arg: SortState) => void;
}

/**
 * Render a sortable table header cell.
 */
function SimpleTableCellTh({
  data,
  columnDef,
  sortState,
  onBeforeSort,
  onSort
}: SimpleTableCellThProps) {
  const {
    name,
    label,
    sort,
    sortable,
    nullsLast,
    headCellStyle
  } = columnDef;

  const {columns} = sortState;
  const curIndex = columns.findIndex(c => c.name === name);
  const curDirection = curIndex > -1 ? columns[curIndex].direction : null;

    /**
     * Apply sorting for the current column and update sort state.
     *
     * @param reset - When true, clears sorting for the column.
     */
    const sortByColumns = React.useCallback(
      async (reset: boolean) => {
      // make a copy to prevent pollute original `columns`
      const newColumns = [...columns];
      let {sortedData} = sortState;

      let idx = curIndex;
      if (idx > -1) {
        newColumns[idx].direction = getNextDirection(newColumns[idx].direction);
        if (reset || newColumns[idx].direction === null) {
          // reset
          newColumns.splice(idx, 1);
        }
      }
      else if (!reset) {
        idx = newColumns.length;
        newColumns.push({
          name,
          direction: 'ascending',
          nullsLast,
          sort
        });
      }

      if (newColumns.every(({direction}) => direction === null)) {
        newColumns.length = 0;
      }

      onBeforeSort && onBeforeSort({columns: newColumns, sortedData: []});

      // await for sorting=true applied (transition takes ~150ms)
      // Note: while waiting for the 300ms, sortByColumns can be triggered
      // again. That's why we need to make a copy of `columns` at the beginning
      // of the function to prevent dirty data
      await sleep(300);

      sortedData = applySorts(data, newColumns);

      onSort && onSort({columns: newColumns, sortedData});
    },
    [
      data,
      nullsLast,
      columns,
      sortState,
      curIndex,
      onBeforeSort,
      onSort,
      name,
      sort
    ]
  );

  const handleSwitch = React.useCallback(
    () => sortByColumns(false),
    [sortByColumns]
  );

    /**
     * Reset sorting when the header cell is double-clicked.
     */
    const handleReset = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        sortByColumns(true);
      },
      [sortByColumns]
    );

  return React.useMemo(
    () => (
      <th
       {...(sortable ? {
         'data-sorted': curDirection,
         onClick: handleSwitch,
         onDoubleClick: handleReset
       } : {})}
       data-colname={name}
       data-column
       data-nth-sort={curIndex + 1}
       data-sortable={sortable}
       style={headCellStyle}>
        <div className={style['th-container']}>
          <div className={style['label']}>
            {label}
          </div>
          {sortable && <div className={style['sort-icon']}>
            {curIndex > -1 ? <>
              {curDirection === 'ascending' && <FaSortUp />}
              {curDirection === 'descending' && <FaSortDown />}
              {curDirection === null && <FaSort />}
              {columns.length > 1 ? <sup>{curIndex + 1}</sup> : null}
            </> : <FaSort />}
          </div>}
        </div>
      </th>
    ),
    [
      name,
      label,
      columns,
      sortable,
      curIndex,
      curDirection,
      handleSwitch,
      handleReset,
      headCellStyle
    ]
  );
}

export default SimpleTableCellTh;
