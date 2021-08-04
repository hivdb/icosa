import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import useDownloadButton from './use-download-button';
import SimpleTableTable from './table';
import style from './style.module.scss';
import ColumnDef from './column-def';
import {columnDefShape} from './prop-types';

export {ColumnDef};


function SimpleTable({
  compact,
  lastCompact,
  color,
  data,
  cacheKey,
  columnDefs,
  sheetName,
  getRowKey,
  className,
  tableScrollStyle,
  tableStyle,
  afterTable,
  disableCopy
}) {

  const tableRef = React.useRef();
  const [mobileLabelWidth, setMobileLabelWidth] = React.useState('auto');
  const [sorting, setSorting] = React.useState(false);
  const [enableRowSpan, setEnableRowSpan] = React.useState(true);

  const {copying, element: downloadButton} = useDownloadButton({
    tableRef,
    sheetName
  });

  // Use useEffect to delay setting `enableRowSpan` for one cycle.
  // Allow `copying` being passed to data-copying ASAP.
  React.useEffect(
    () => {
      setTimeout(() => setEnableRowSpan(!copying));
    },
    [setEnableRowSpan, copying]
  );

  React.useEffect(
    () => { 
      if (!tableRef.current) {
        return;
      }
      const elem = tableRef.current;
      const hCells = Array.from(elem.querySelectorAll(
        ':scope > div > table > thead > tr > th[data-column]'
      ));
      setMobileLabelWidth(
        `${
          Math.max(...hCells.map(th => th.textContent.length)) * 0.55
        }rem`
      );
    },
    []
  );

  const onBeforeSort = React.useCallback(
    () => setSorting(true),
    [setSorting]
  );

  const onSort = React.useCallback(
    () => setSorting(false),
    [setSorting]
  );

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('render <SimpleTable />', (new Date()).getTime());
  }

  return <>
    <div
     ref={tableRef}
     data-nocopy={disableCopy}
     data-copying={copying}
     data-sorting={sorting}
     data-compact={compact}
     data-last-compact={lastCompact}
     style={{
       '--mobile-label-width': mobileLabelWidth
     }}
     className={classNames(
       style['simple-table-container'],
       className ? `${className}__container` : null
     )}>
      <div
       className={classNames(
         style['simple-table-scroll'],
         className ? `${className}__scroll` : null
       )}
       style={tableScrollStyle}>
        <SimpleTableTable
         data={data}
         cacheKey={cacheKey}
         onBeforeSort={onBeforeSort}
         onSort={onSort}
         columnDefs={columnDefs}
         color={color}
         getRowKey={getRowKey}
         className={className}
         tableStyle={tableStyle}
         enableRowSpan={enableRowSpan} />
        {afterTable}
      </div>
      {disableCopy ? null : downloadButton}
    </div>
    <div className={style.clearfix} />
  </>;
  
}
SimpleTable.propTypes = {
  compact: PropTypes.bool.isRequired,
  lastCompact: PropTypes.bool.isRequired,
  color: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.object.isRequired
  ).isRequired,
  cacheKey: PropTypes.string,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired,
  sheetName: PropTypes.string.isRequired,
  getRowKey: PropTypes.func.isRequired,
  className: PropTypes.string,
  tableScrollStyle: PropTypes.object.isRequired,
  tableStyle: PropTypes.object.isRequired,
  afterTable: PropTypes.node,
  disableCopy: PropTypes.bool.isRequired
};

SimpleTable.defaultProps = {
  compact: false,
  disableCopy: false,
  sheetName: 'Sheet1',
  tableScrollStyle: {},
  tableStyle: {},
  getRowKey: () => null
};

export default SimpleTable;
