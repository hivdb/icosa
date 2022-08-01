import React from 'react';
import sleep from 'sleep-promise';
import PropTypes from 'prop-types';
import {FaSortDown} from '@react-icons/all-files/fa/FaSortDown';
import {FaSortUp} from '@react-icons/all-files/fa/FaSortUp';
import {FaSort} from '@react-icons/all-files/fa/FaSort';

import style from './style.module.scss';
import {columnDefShape, sortStateShape} from './prop-types';


function getNextDirection(direction) {
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


function moveNullsLast(data, name) {
  const nonNulls = [];
  const nulls = [];
  for (const item of data) {
    if (
      item[name] === undefined ||
      item[name] === null ||
      item[name] === ''
    ) {
      nulls.push(item);
    }
    else {
      nonNulls.push(item);
    }
  }
  return [...nonNulls, ...nulls];
}


function applySorts(data, columns) {
  let sortedData = [...data];
  for (let idx = columns.length - 1; idx > -1; idx --) {
    const {name, sort, direction, nullsLast} = columns[idx];
    if (direction === 'descending' && idx + 1 < columns.length) {
      const prevCol = columns[idx + 1];
      // if current direction is descending, reverse first to
      // preserve previous sorting order
      sortedData.reverse();
      if (prevCol.direction && prevCol.nullsLast) {
        sortedData = moveNullsLast(sortedData, prevCol.name);
      }
    }
    sortedData = sort(sortedData, name);
    if (direction === 'descending') {
      sortedData.reverse();
    }
    if (direction && nullsLast) {
      sortedData = moveNullsLast(sortedData, name);
    }
  }
  return sortedData;
}


function SimpleTableCellTh({
  data,
  columnDef,
  sortState,
  onBeforeSort,
  onSort
}) {
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

  const sortByColumns = React.useCallback(
    async reset => {
      // make a copy to prevent pollute original `columns`
      const newColumns = [...columns];
      let {sortedData} = sortState;

      let idx = curIndex;
      if (idx > -1) {
        newColumns[idx].direction = getNextDirection(newColumns[idx].direction);
        if (reset) {
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

      onBeforeSort && onBeforeSort({columns: newColumns});

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

  /* const handleReset = React.useCallback(
    e => {
      e && e.preventDefault();
      e && e.stopPropagation();
      sortByColumns(true);
    },
    [sortByColumns]
  ); */

  return React.useMemo(
    () => (
      <th
       {...(sortable ? {
         'data-sorted': curDirection,
         onClick: handleSwitch
         // onDoubleClick: handleReset
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
      // handleReset,
      headCellStyle
    ]
  );
}

SimpleTableCellTh.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.object.isRequired
  ).isRequired,
  columnDef: columnDefShape.isRequired,
  sortState: sortStateShape.isRequired,
  onBeforeSort: PropTypes.func,
  onSort: PropTypes.func
};

export default SimpleTableCellTh;
