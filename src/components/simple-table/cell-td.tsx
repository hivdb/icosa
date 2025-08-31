import React from 'react';
import nestedGet from 'lodash/get';
import classNames from 'classnames';

import style from './style.module.scss';
import type {RowRecord, RowContext} from './types';
import type ColumnDef from './column-def';

interface SimpleTableCellTdProps<T, R extends RowRecord> {
  row: R;
  rowSpan: number;
  rowContext: RowContext;
  columnDef: ColumnDef<T, R>;
  enableRowSpan?: boolean;
}

/**
 * Render a table cell with optional row span handling.
 */
function SimpleTableCellTd<T, R extends RowRecord>({
  row,
  rowSpan,
  rowContext,
  columnDef,
  enableRowSpan = true
}: SimpleTableCellTdProps<T, R>) {

  return React.useMemo(() => {
    const {
      name,
      render,
      renderConfig,
      bodyCellColSpan,
      textAlign,
      bodyCellStyle
    } = columnDef;

    const jsx = render(
      nestedGet(row, name) as T,
      row,
      rowContext,
      renderConfig
    );
    const isEmpty = typeof jsx === 'string' && jsx.length === 0;
    return <td
     data-colname={name}
     className={classNames(
       enableRowSpan && rowSpan === 0 ?
         style.hide : null,
       style[textAlign]
     )}
     {...(isEmpty ? {'data-is-empty': ''} : null)}
     style={bodyCellStyle}
     colSpan={bodyCellColSpan && bodyCellColSpan > 1 ? bodyCellColSpan : undefined}
     rowSpan={enableRowSpan && rowSpan > 1 ? rowSpan : undefined}>
      {/*<span
       className={style['cell-label']}>{label}</span>*/}
      <span className={style['cell-value']}>{jsx}</span>
    </td>;
  }, [
    row,
    rowSpan,
    rowContext,
    columnDef,
    enableRowSpan
  ]);

}

export default SimpleTableCellTd;
