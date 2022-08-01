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


function setNullsLast(data, name) {
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

  const handleSort = React.useCallback(
    async () => {
      let {sortedData} = sortState;

      let idx = curIndex;
      if (idx > -1) {
        const direction = getNextDirection(columns[idx].direction);
        if (direction === null) {
          // remove idx'th column and what after idx'th column
          columns.splice(idx);
        }
        else {
          columns[idx].direction = direction;
          // remove what after idx'th column
          columns.splice(idx + 1);
        }
      }
      else {
        idx = columns.length;
        columns.push({
          name,
          direction: 'ascending'
        });
      }

      onBeforeSort && onBeforeSort({columns});

      // await for sorting=true applied (transition takes 150ms)
      await sleep(300);

      if (columns.length === 0) {
        sortedData = data;
      }
      else if (columns.length === idx) {
        sortedData = columns[idx - 1].sortedData;
      }
      else {
        if (columns[idx].direction === 'ascending') {
          sortedData = sort(
            [...(idx === 0 ? data : columns[idx - 1].sortedData)],
            name
          );
        }
        else { // descending
          // make a copy of sortedData.reverse() to update the reference
          sortedData = [...(columns[idx].sortedData).reverse()];
        }
        if (nullsLast) {
          sortedData = setNullsLast(sortedData, name);
        }
        columns[idx].sortedData = sortedData;
      }

      onSort && onSort({columns, sortedData});
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

  return React.useMemo(
    () => (
      <th
       {...(sortable ? {
         'data-sorted': curDirection,
         onClick: handleSort
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
      handleSort,
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
