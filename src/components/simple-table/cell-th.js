import React from 'react';
import sleep from 'sleep-promise';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
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
    headCellStyle
  } = columnDef;

  const sortFunc = React.useMemo(
    () => {
      let sortFunc = sort;
      if (sortFunc && typeof sortFunc !== 'function') {
        const sortKeys = sortFunc.map(key => (
          key instanceof Function ? key : `${name}.${key}`
        ));
        sortFunc = value => sortBy(value, item => sortKeys.map(
          key => key instanceof Function ?
            key(item) :
            nestedGet(item, key) ||
            ''
        ));
      }
      return sortFunc;
    },
    [sort, name]
  );

  const handleSort = React.useCallback(
    async () => {
      let {
        byColumn,
        direction,
        sortedData
      } = sortState;
      
      if (name === byColumn) {
        direction = getNextDirection(direction);
      }
      else {
        direction = 'ascending';
      }
      
      byColumn = name;

      onBeforeSort && onBeforeSort({
        byColumn,
        direction
      });

      // await for sorting=true applied (transition takes 150ms)
      await sleep(300);

      if (direction === null) {
        sortedData = data;
      }
      else if (direction === 'ascending') {
        sortedData = sortFunc(sortedData, name);
      }
      else { // descending
        sortedData = sortedData.reverse();
      }

      onSort && onSort({
        byColumn,
        direction,
        sortedData
      });

    },
    [data, sortState, onBeforeSort, onSort, name, sortFunc]
  );

  const {
    byColumn,
    direction
  } = sortState;

  return React.useMemo(
    () => (
      <th
       {...(sortable ? {
         'data-sorted': (
           byColumn === name ? direction : null
         ),
         onClick: handleSort
       } : {})}
       data-column
       data-sortable={sortable}
       style={headCellStyle}>
        <div className={style['th-container']}>
          <div className={style['label']}>
            {label}
          </div>
          {sortable && <div className={style['sort-icon']}>
            {byColumn === name && <>
              {direction === 'ascending' && <FaSortUp />}
              {direction === 'descending' && <FaSortDown />}
            </>}
            {(byColumn !== name ||
              !direction) && <FaSort />}
          </div>}
        </div>
      </th>
    ),
    [
      name,
      label,
      sortable,
      byColumn,
      direction,
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
