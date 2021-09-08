import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import classNames from 'classnames';

import style from './style.module.scss';
import {columnDefShape} from './prop-types';


function SimpleTableCellTd({
  row,
  rowSpan,
  rowContext,
  columnDef,
  enableRowSpan
}) {

  return React.useMemo(
    () => {
      const {
        name, render, renderConfig, bodyCellColSpan,
        textAlign, label, bodyCellStyle
      } = columnDef;

      const jsx = render(
        nestedGet(row, name),
        row,
        rowContext,
        renderConfig
      );
      const isEmpty = typeof jsx === 'string' && jsx.length === 0;
      return <td
       className={classNames(
         enableRowSpan && rowSpan === 0 ?
           style.hide : null,
         style[textAlign]
       )}
       {...(isEmpty ? {'data-is-empty': ''} : null)}
       style={bodyCellStyle}
       colSpan={bodyCellColSpan > 1 ? bodyCellColSpan : null}
       rowSpan={enableRowSpan && rowSpan > 1 ? rowSpan : null}>
        <span
         className={style['cell-label']}>{label}</span>
        <span className={style['cell-value']}>{jsx}</span>
      </td>;
    },
    [
      row,
      rowSpan,
      rowContext,
      columnDef,
      enableRowSpan
    ]
  );

}

SimpleTableCellTd.propTypes = {
  row: PropTypes.object.isRequired,
  rowSpan: PropTypes.number.isRequired,
  rowContext: PropTypes.object.isRequired,
  columnDef: columnDefShape.isRequired,
  enableRowSpan: PropTypes.bool.isRequired
};

SimpleTableCellTd.defaultProps = {
  enableRowSpan: true
};

export default SimpleTableCellTd;
