import React from 'react';
import sleep from 'sleep-promise';
import startCase from 'lodash/startCase';
import {FaCaretUp} from '@react-icons/all-files/fa/FaCaretUp';
import {FaCaretDown} from '@react-icons/all-files/fa/FaCaretDown';

import {dumpCSV, dumpTSV, dumpExcelSimple} from '../../utils/sheet-utils';
import {makeDownload} from '../../utils/download';

import style from './style.module.scss';


const OPT_CHANGE_EVENT = 'SimpleTableDefaultDownloadOptChanged';
const KEY_DEFAULT_DOWNLOAD_OPT = '--simple-table-default-download-opt';
const DEFAULT_DOWNLOAD_OPT = 'copy-tsv';
const DOWNLOAD_OPTS = [
  'download-csv',
  'download-excel',
  'copy-tsv'
];


function mergeRetainOrder(...arrays) {
  // modified from https://stackoverflow.com/a/53727840/2644759
  const result = [];
  arrays.forEach(array => {
    array.forEach((item, idx) => {
      // check if the item has already been added, if not, try to add
      if (!result.includes(item)) {
        // if item is not first item, find position of his left sibling in
        // result array
        if (idx > 0) {
          const resultIdx = result.indexOf(array[idx - 1]);
          // add item after left sibling position
          result.splice(resultIdx + 1, 0, item);
          return;
        }
        result.push(item);
      }
    });
  });
  return result;
}


function useDefaultDownloadOption({onSave}) {

  const load = React.useCallback(
    () => {
      let opt = window.localStorage.getItem(KEY_DEFAULT_DOWNLOAD_OPT);
      if (!DOWNLOAD_OPTS.includes(opt)) {
        opt = DEFAULT_DOWNLOAD_OPT;
      }
      return opt;
    },
    []
  );

  const save = React.useCallback(
    opt => {
      window.localStorage.setItem(KEY_DEFAULT_DOWNLOAD_OPT, opt);
      window.dispatchEvent(new Event(OPT_CHANGE_EVENT));
      onSave();
    },
    [onSave]
  );

  const [defaultOpt, setDefaultOpt] = React.useState(load());

  const handleChange = React.useCallback(
    () => {
      const newDefaultOpt = load();
      if (defaultOpt !== newDefaultOpt) {
        setDefaultOpt(newDefaultOpt);
      }
    },
    [defaultOpt, setDefaultOpt, load]
  );

  React.useEffect(
    () => {
      window.addEventListener(
        OPT_CHANGE_EVENT,
        handleChange,
        false
      );
      return () => window.removeEventListener(
        OPT_CHANGE_EVENT,
        handleChange,
        false
      );
    },
    [handleChange]
  );

  return [defaultOpt, save];
}


function useOptMenu() {
  const [optMenu, setOptMenu] = React.useState(false);
  const toggleOptMenu = React.useCallback(
    () => setOptMenu(!optMenu),
    [setOptMenu, optMenu]
  );
  const closeOptMenu = React.useCallback(
    () => setOptMenu(false),
    [setOptMenu]
  );

  const condHideDownloadOptMenu = React.useCallback(
    (evt) => {
      window.test = evt.target;
      if (!evt.target.closest('*[data-ignore-global-click]')) {
        closeOptMenu();
      }
    },
    [closeOptMenu]
  );

  React.useEffect(
    () => {
      document.addEventListener(
        'click',
        condHideDownloadOptMenu,
        false
      );
      return () => document.removeEventListener(
        'click',
        condHideDownloadOptMenu,
        false
      );
    },
    [condHideDownloadOptMenu]
  );
  return [optMenu, toggleOptMenu, closeOptMenu];
}


export default function useDownloadButton({
  columnDefs,
  sheetName,
  tableRef
}) {

  const [copying, setCopying] = React.useState(false);

  const [optMenu, toggleOptMenu, closeOptMenu] = useOptMenu();

  const [defaultOpt, setDefaultOpt] = useDefaultDownloadOption({
    onSave: closeOptMenu
  });

  const readTableData = React.useCallback(
    async () => {
      setCopying(true);
      await sleep(600);
      try {
        const node = tableRef.current.querySelector('table');
        let header = [];
        let content = [];
        const labels = [];
        for (const row of node.rows) {
          if (row.dataset.skipCopy) {
            continue;
          }
          if (row.parentElement.tagName === 'THEAD') {
            for (let i = 0; i < columnDefs.length; i ++) {
              const cell = row.cells[i];
              const colDef = columnDefs[i];
              labels.push(colDef.exportLabel || cell.innerText);
            }
            continue;
          }
          let tr = {};
          for (let i = 0; i < columnDefs.length; i ++) {
            const cell = row.cells[i];
            const colDef = columnDefs[i];
            const label = labels[i] || startCase(colDef.name);
            if (colDef.exportCell) {
              // columnDef can supply an "exportCell" method
              const payload = JSON.parse(row.dataset.payload);
              const cellData = colDef.exportCell(
                payload[colDef.name],
                payload
              );
              if (cellData instanceof Array) {
                for (const one of cellData) {
                  for (const key in one) {
                    if (key) {
                      tr[`${label}: ${key}`] = one[key];
                    }
                    else {
                      tr[label] = one[key];
                    }
                  }
                }
              }
              else if (cellData instanceof Object) {
                for (const key in cellData) {
                  if (key) {
                    tr[`${label}: ${key}`] = cellData[key];
                  }
                  else {
                    tr[label] = cellData[key];
                  }
                }
              }
              else {
                tr[label] = cellData;
              }
            }
            else {
              tr[label] = cell.innerText;
            }
          }
          header = mergeRetainOrder(
            header,
            Object.keys(tr)
          );
          content.push(tr);
        }
        const headerWithValue = header.filter(
          h => content.some(row => row[h])
        );
        return [headerWithValue, ...content.map(
          trmap => headerWithValue.map(
            field => trmap[field]
          )
        )];
      }
      finally {
        setCopying(false);
      }
    },
    [tableRef, columnDefs]
  );

  const handleCopy = React.useCallback(
    async e => {
      e && e.preventDefault();
      const content = await readTableData();
      navigator.clipboard.writeText(dumpTSV(content));
      setDefaultOpt('copy-tsv');
    },
    [readTableData, setDefaultOpt]
  );

  const handleDownloadCSV = React.useCallback(
    async e => {
      e && e.preventDefault();
      const content = await readTableData();
      makeDownload(
        'datasheet.csv',
        'text/csv;charset=utf-8',
        dumpCSV(content, ',', true)
      );
      setDefaultOpt('download-csv');
    },
    [readTableData, setDefaultOpt]
  );

  const handleDownloadExcel = React.useCallback(
    async e => {
      e && e.preventDefault();
      const content = await readTableData();
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
      setDefaultOpt('download-excel');
    },
    [readTableData, setDefaultOpt, sheetName]
  );

  const element = React.useMemo(
    () => (
      <div
       data-ignore-global-click
       className={style['download-options']}>
        <div className={style['download-button-group']}>
          {defaultOpt === 'copy-tsv' ?
            <button
             onClick={handleCopy}>
              Copy to clipboard
            </button> : null}
          {defaultOpt === 'download-csv' ?
            <button
             onClick={handleDownloadCSV}>
              Download CSV
            </button> : null}
          {defaultOpt === 'download-excel' ?
            <button
             onClick={handleDownloadExcel}>
              Download Excel
            </button> : null}
          <button
           className={style['btn-more-option']}
           onClick={toggleOptMenu}
           aria-label="More options">
            {optMenu ?
              <FaCaretUp data-ignore-global-click /> :
              <FaCaretDown data-ignore-global-click />}
          </button>
        </div>
        {optMenu &&
          <div className={style['option-menu']}>
            {defaultOpt !== 'copy-tsv' &&
              <a onClick={handleCopy} href="#copy-tsv">
                Copy to clipboard
              </a>}
            {defaultOpt !== 'download-csv' &&
              <a onClick={handleDownloadCSV} href="#download-csv">
                Download CSV
              </a>}
            {defaultOpt !== 'download-excel' &&
              <a onClick={handleDownloadExcel} href="#download-excel">
                Download Excel
              </a>}
          </div>}
      </div>
    ),
    [
      defaultOpt,
      handleCopy,
      handleDownloadCSV,
      handleDownloadExcel,
      optMenu,
      toggleOptMenu
    ]
  );
  return {
    element,
    copying
  };

}
