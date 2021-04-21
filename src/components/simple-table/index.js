import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import classNames from 'classnames';
import style from './style.module.scss';
import ColumnDef from './column-def';
import {FaCaretUp} from '@react-icons/all-files/fa/FaCaretUp';
import {FaCaretDown} from '@react-icons/all-files/fa/FaCaretDown';
import {FaSortDown} from '@react-icons/all-files/fa/FaSortDown';
import {FaSortUp} from '@react-icons/all-files/fa/FaSortUp';
import {FaSort} from '@react-icons/all-files/fa/FaSort';
import {dumpCSV, dumpTSV, dumpExcelSimple} from '../../utils/sheet-utils';

import {makeDownload} from '../../utils/download';

export {ColumnDef};

const OPT_CHANGE_EVENT = 'SimpleTableDefaultDownloadOptChanged';
const KEY_DEFAULT_DOWNLOAD_OPT = '--simple-table-default-download-opt';
const DEFAULT_DOWNLOAD_OPT = 'copy-tsv';
const DOWNLOAD_OPTS = [
  'download-csv',
  'download-excel',
  'copy-tsv'
];


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


function groupBySpanIndex(rows) {
  const groups = [];
  let prevRow;
  let prevGroup;
  for (const row of rows) {
    let curGroup;
    if (prevRow && prevRow._spanIndex === row._spanIndex) {
      prevGroup.push(row);
      curGroup = prevGroup;
    }
    else {
      curGroup = [row];
      groups.push(curGroup);
    }
    prevRow = row;
    prevGroup = curGroup;
  }
  return groups;
}


export default class SimpleTable extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    cacheKey: PropTypes.string,
    compact: PropTypes.bool.isRequired,
    lastCompact: PropTypes.bool.isRequired,
    sheetName: PropTypes.string.isRequired,
    columnDefs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      render: PropTypes.func.isRequired,
      sort: PropTypes.oneOfType([
        PropTypes.func.isRequired,
        PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.func.isRequired,
            PropTypes.string.isRequired
          ]).isRequired
        ).isRequired
      ]).isRequired,
      sortable: PropTypes.bool.isRequired
    })),
    getRowKey: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ).isRequired,
    tableScrollStyle: PropTypes.object.isRequired,
    tableStyle: PropTypes.object.isRequired,
    disableCopy: PropTypes.bool.isRequired,
    afterTable: PropTypes.node
  }

  static defaultProps = {
    compact: false,
    disableCopy: false,
    sheetName: 'Sheet1',
    tableScrollStyle: {},
    tableStyle: {},
    getRowKey: () => null
  };

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      sortedByColumn: null,
      sortedData: data,
      sortDirection: null,
      enableRowSpan: true,
      showOptMenu: false,
      defaultOpt: this.loadDefaultDownloadOption(),
      copying: false
    };
    this.table = React.createRef();
  }

  handleStorageChange = () => {
    const defaultOpt = this.loadDefaultDownloadOption();
    if (this.state.defaultOpt !== defaultOpt) {
      this.setState({defaultOpt});
    }
  }

  loadDefaultDownloadOption = () => {
    let opt = window.localStorage.getItem(KEY_DEFAULT_DOWNLOAD_OPT);
    if (!DOWNLOAD_OPTS.includes(opt)) {
      opt = DEFAULT_DOWNLOAD_OPT;
    }
    return opt;
  }
  
  saveDefaultDownloadOption = (opt) => {
    window.localStorage.setItem(KEY_DEFAULT_DOWNLOAD_OPT, opt);
    window.dispatchEvent(new Event(OPT_CHANGE_EVENT));
    this.setState({showOptMenu: false});
  }

  componentDidMount() {
    window.addEventListener(
      OPT_CHANGE_EVENT, this.handleStorageChange, false
    );
    document.addEventListener(
      'click', this.condHideDownloadOptMenu, false
    );
    this.initMobileLabelWidth();
  }

  componentWillUnmount() {
    window.removeEventListener(
      OPT_CHANGE_EVENT, this.handleStorageChange, false
    );
    document.removeEventListener(
      'click', this.condHideDownloadOptMenu, false
    );
  }

  componentDidUpdate(prevProps) {
    const {cacheKey, data} = this.props;
    if (prevProps.cacheKey !== cacheKey) {
      // cache key was updated
      this.setState({
        sortedByColumn: null,
        sortedData: data,
        sortDirection: null
      });
    }
  }

  handleSort(column, sortFunc) {
    if (sortFunc && typeof sortFunc !== 'function') {
      const sortKeys = sortFunc.map(key => (
        key instanceof Function ? key : `${column}.${key}`
      ));
      sortFunc = value => sortBy(value, item => sortKeys.map(
        key => key instanceof Function ?
          key(item) :
          nestedGet(item, key) ||
          ''
      ));
    }
    return () => {
      let {sortedByColumn, sortDirection, sortedData} = this.state;

      if (column === sortedByColumn) {
        sortDirection = getNextDirection(sortDirection);
      }
      else {
        sortDirection = 'ascending';
      }
      sortedByColumn = column;

      if (sortDirection === null) {
        const {data} = this.props;
        sortedData = data;
      }
      else if (sortDirection === 'ascending') {
        sortedData = sortFunc(sortedData, column);
      }
      else { // descending
        sortedData = sortedData.reverse();
      }

      this.setState({
        sortedByColumn,
        sortedData,
        sortDirection
      });
    };
  }

  initMobileLabelWidth() {
    if (!this.table.current) {
      return;
    }
    const elem = this.table.current;
    const hCells = Array.from(elem.querySelectorAll(
      ':scope > div > table > thead > tr > th[data-column]'
    ));
    elem.style.setProperty(
      '--mobile-label-width',
      `${
        Math.max(...hCells.map(th => th.textContent.length)) * 0.55
      }rem`
    );
  }

  readTableData = () => {
    this.setState({
      copying: true,
      enableRowSpan: false
    });
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        const node = this.table.current.querySelector('table');
        let content = [];
        for (const row of node.rows) {
          let tr = [];
          for (const cell of row.cells) {
            tr.push(cell.innerText);
          }
          content.push(tr);
        }
        resolve(content);
        this.setState({
          copying: false,
          enableRowSpan: true
        });
      }, 300);
    });
    return promise;
  }

  handleCopy = async (e) => {
    e && e.preventDefault();
    const content = await this.readTableData();
    navigator.clipboard.writeText(dumpTSV(content));
    this.saveDefaultDownloadOption('copy-tsv');
  }

  handleDownloadCSV = async (e) => {
    e && e.preventDefault();
    const content = await this.readTableData();
    makeDownload(
      'datasheet.csv',
      'text/csv;charset=utf-8',
      dumpCSV(content, ',', true)
    );
    this.saveDefaultDownloadOption('download-csv');
  }

  handleDownloadExcel = async (e) => {
    e && e.preventDefault();
    const {sheetName} = this.props;
    const content = await this.readTableData();
    const xlsxBlob = dumpExcelSimple(
      content,
      sheetName
    );
    makeDownload(
      /* fileName=  */ 'datasheet.xlsx',
      /* mediaType= */ null,
      /* data=      */ xlsxBlob,
      /* isBlob=    */ true
    );
    this.saveDefaultDownloadOption('download-excel');
  }

  toggleDownloadOptMenu = () => {
    this.setState({showOptMenu: !this.state.showOptMenu});
  }
  
  condHideDownloadOptMenu = (evt) => {
    window.test = evt.target;
    if (!evt.target.closest('*[data-ignore-global-click]')) {
      if (this.state.showOptMenu) {
        this.setState({showOptMenu: false});
      }
    }
  }

  getRowSpanMatrix() {
    const {columnDefs} = this.props;
    const {sortedData} = this.state;
    const matrix = new Array(sortedData.length).fill(1).map(
      () => new Array(columnDefs.length).fill(1)
    );
    if (columnDefs.every(({multiCells}) => !multiCells)) {
      return matrix;
    }
    const groupedData = groupBySpanIndex(sortedData);
    let idx = 0;
    for (const group of groupedData) {
      const rowSpan = group.length;
      for (let jdx = 0; jdx < columnDefs.length; jdx ++) {
        if (columnDefs[jdx].multiCells) {
          continue;
        }
        matrix[idx][jdx] = rowSpan;
        for (let offset = 1; offset < rowSpan; offset ++) {
          matrix[idx + offset][jdx] = 0;
        }
      }
      idx += rowSpan;
    }
    return matrix;
  }

  render() {
    const {
      compact,
      lastCompact,
      color, columnDefs,
      getRowKey, className,
      tableScrollStyle, tableStyle,
      afterTable
    } = this.props;
    const {
      sortedByColumn, sortedData,
      sortDirection, enableRowSpan,
      copying, showOptMenu,
      defaultOpt
    } = this.state;
    const context = columnDefs.reduce((acc, {name}) => {
      acc[name] = {};
      return acc;
    }, {});
    const rowSpanMatrix = this.getRowSpanMatrix();

    const {disableCopy} = this.props;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('render table', (new Date()).getTime());
    }

    return <>
      <div
       ref={this.table}
       data-nocopy={disableCopy}
       data-copying={copying}
       data-compact={compact}
       data-last-compact={lastCompact}
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
          <table
           style={tableStyle}
           data-color={color}
           className={classNames(
             style['simple-table'],
             className
           )}>
            <thead>
              <tr>
                {columnDefs.map(({
                  name, label, sort, sortable, headCellStyle
                }, idx) => (
                  <th
                   {...(sortable ? {
                     'data-sorted': (
                       sortedByColumn === name ? sortDirection : null
                     ),
                     onClick: this.handleSort(name, sort)
                   } : {})}
                   data-column
                   data-sortable={sortable}
                   style={headCellStyle}
                   key={idx}>
                    <div className={style['th-container']}>
                      <div className={style['label']}>
                        {label}
                      </div>
                      {sortable && <div className={style['sort-icon']}>
                        {sortedByColumn === name && <>
                          {sortDirection === 'ascending' && <FaSortUp />}
                          {sortDirection === 'descending' && <FaSortDown />}
                        </>}
                        {(sortedByColumn !== name ||
                          !sortDirection) && <FaSort />}
                      </div>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => (
                <tr key={getRowKey(row) || idx}>
                  {columnDefs.map(({
                    name, render, renderConfig, bodyCellColSpan,
                    textAlign, label, bodyCellStyle
                  }, jdx) => {
                    const jsx = render(
                      nestedGet(row, name),
                      row,
                      context[name],
                      renderConfig
                    );
                    const isEmpty = typeof jsx === 'string' && jsx.length === 0;
                    return <td
                     key={jdx}
                     className={classNames(
                       enableRowSpan && rowSpanMatrix[idx][jdx] === 0 ?
                         style.hide : null,
                       style[textAlign]
                     )}
                     {...(isEmpty ? {'data-is-empty': ''} : null)}
                     style={bodyCellStyle}
                     colSpan={bodyCellColSpan > 1 ? bodyCellColSpan : null}
                     rowSpan={
                       enableRowSpan && rowSpanMatrix[idx][jdx] > 1 ?
                         rowSpanMatrix[idx][jdx] : null
                     }>
                      <span
                       className={style['cell-label']}>{label}</span>
                      <span className={style['cell-value']}>{jsx}</span>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {afterTable}
        </div>
        {disableCopy ? null:
        <div
         data-ignore-global-click
         className={style['download-options']}>
          <div className={style['download-button-group']}>
            {defaultOpt === 'copy-tsv' ?
              <button
               onClick={this.handleCopy}>
                Copy to clipboard
              </button> : null}
            {defaultOpt === 'download-csv' ?
              <button
               onClick={this.handleDownloadCSV}>
                Download CSV
              </button> : null}
            {defaultOpt === 'download-excel' ?
              <button
               onClick={this.handleDownloadExcel}>
                Download Excel
              </button> : null}
            <button
             className={style['btn-more-option']}
             onClick={this.toggleDownloadOptMenu}
             aria-label="More options">
              {showOptMenu ?
                <FaCaretUp data-ignore-global-click /> :
                <FaCaretDown data-ignore-global-click />}
            </button>
          </div>
          {showOptMenu &&
            <div className={style['option-menu']}>
              {defaultOpt !== 'copy-tsv' &&
                <a onClick={this.handleCopy} href="#copy-tsv">
                  Copy to clipboard
                </a>}
              {defaultOpt !== 'download-csv' &&
                <a onClick={this.handleDownloadCSV} href="#download-csv">
                  Download CSV
                </a>}
              {defaultOpt !== 'download-excel' &&
                <a onClick={this.handleDownloadExcel} href="#download-excel">
                  Download Excel
                </a>}
            </div>}
        </div>}
      </div>
      <div className={style.clearfix} />
    </>;
  }
}
