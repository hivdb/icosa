import React from 'react';
import classNames from 'classnames';

import useDownloadButton from './use-download-button';
import SimpleTableTable from './table';
import type {SimpleTableTableProps} from './table';
import ColumnDef from './column-def';
import style from './style.module.scss';
export {ColumnDef};
import type {RowRecord} from './types';

interface SimpleTableProps extends Omit<SimpleTableTableProps, 'enableRowSpan' | 'onBeforeSort' | 'onSort'> {
  windowScroll?: boolean;
  compact?: boolean;
  lastCompact?: boolean;
  noHeaderOverlapping?: boolean;
  cacheKey?: string;
  sheetName?: string;
  tableScrollStyle?: React.CSSProperties;
  afterTable?: React.ReactNode;
  disableCopy?: boolean;
}

/**
 * Container component for rendering a sortable and downloadable table.
 */
export default function SimpleTable({
  windowScroll = false,
  compact = false,
  lastCompact = false,
  noHeaderOverlapping = false,
  color,
  data,
  cacheKey,
  columnDefs,
  sheetName = 'Sheet1',
  onRowClick,
  getRowKey = () => null,
  className,
  tableScrollStyle = {},
  tableStyle = {},
  afterTable,
  disableCopy = false
}: SimpleTableProps) {

  const tableRef = React.useRef<HTMLDivElement>(null);
  const [mobileLabelWidth, setMobileLabelWidth] = React.useState('auto');
  const [sorting, setSorting] = React.useState(false);
  const [enableRowSpan, setEnableRowSpan] = React.useState(true);

  const {copying, element: downloadButton} = useDownloadButton({
    tableRef,
    sheetName,
    columnDefs
  });

  // Use useEffect to delay setting `enableRowSpan` for 300ms.
  // Allow `copying` being passed to data-copying ASAP.
  React.useEffect(
    () => {
      let prevent = false;
      setTimeout(() => prevent || setEnableRowSpan(!copying), 200);
      return () => {
        prevent = true;
      };
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
     data-window-scroll={windowScroll}
     data-no-header-overlapping={
      noHeaderOverlapping === false ? undefined : ''
     }
    style={{
      '--mobile-label-width': mobileLabelWidth
    } as React.CSSProperties}
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
         key={cacheKey}
         onRowClick={onRowClick}
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
