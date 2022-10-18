import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Loader from '../loader';

import style from './style.module.scss';
import {columnDefShape} from './prop-types';
import useRowSpanMatrix from './use-rowspan-matrix';
import useSortState from './use-sort-state';
import CellTh from './cell-th';
import CellTd from './cell-td';


SimpleTableTable.propTypes = {
  color: PropTypes.string,
  className: PropTypes.string,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired,
  getRowKey: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.object.isRequired
  ).isRequired,
  tableStyle: PropTypes.object.isRequired,
  enableRowSpan: PropTypes.bool.isRequired,
  onBeforeSort: PropTypes.func,
  onSort: PropTypes.func,
  onRowClick: PropTypes.func
};

SimpleTableTable.defaultProps = {
  tableStyle: {},
  getRowKey: () => null,
  enableRowSpan: true
};

export default function SimpleTableTable({
  data,
  onRowClick,
  onBeforeSort,
  onSort,
  columnDefs,
  color,
  getRowKey,
  className,
  tableStyle,
  enableRowSpan
}) {

  const [
    sortState,
    setSortState
  ] = useSortState(data);

  const handleSort = React.useCallback(
    sortState => {
      setSortState(sortState);
      onSort(sortState);
    },
    [setSortState, onSort]
  );

  const rowSpanMatrix = useRowSpanMatrix({
    columnDefs, data: sortState.sortedData
  });

  return React.useMemo(
    () => {
      const context = columnDefs.reduce((acc, {name}) => {
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
