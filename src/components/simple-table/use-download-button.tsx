import React from 'react';
import sleep from 'sleep-promise';
import startCase from 'lodash/startCase';
import {FaCaretUp} from '@react-icons/all-files/fa/FaCaretUp';
import {FaCaretDown} from '@react-icons/all-files/fa/FaCaretDown';

import type {RowRecord} from './types';
import type ColumnDef from './column-def';

import {dumpCSV, dumpTSV, dumpExcelSimple} from '../../utils/sheet-utils';
import {makeDownload} from '../../utils/download';

import style from './style.module.scss';


const OPT_CHANGE_EVENT = 'SimpleTableDefaultDownloadOptChanged';
const KEY_DEFAULT_DOWNLOAD_OPT = '--simple-table-default-download-opt';
const DEFAULT_DOWNLOAD_OPT: DownloadOpt = 'copy-tsv';
const DOWNLOAD_OPTS = [
  'download-csv',
  'download-excel',
  'copy-tsv'
] as const;
type DownloadOpt = typeof DOWNLOAD_OPTS[number];


function mergeRetainOrder<T>(...arrays: T[][]): T[] {
  // modified from https://stackoverflow.com/a/53727840/2644759
  const result: T[] = [];
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


interface DefaultDownloadOptionArgs {
  onSave: () => void;
}

/**
 * Track the user's preferred download option using localStorage.
 *
 * @param onSave - Callback invoked after the preference is updated.
 * @returns The current option and a saver function.
 */
function useDefaultDownloadOption({onSave}: DefaultDownloadOptionArgs) {

  const load = React.useCallback(
    (): DownloadOpt => {
      const stored = window.localStorage.getItem(KEY_DEFAULT_DOWNLOAD_OPT) as DownloadOpt | null;
      return stored && DOWNLOAD_OPTS.includes(stored as DownloadOpt)
        ? stored
        : DEFAULT_DOWNLOAD_OPT;
    },
    []
  );

  const save = React.useCallback(
    (opt: DownloadOpt) => {
      window.localStorage.setItem(KEY_DEFAULT_DOWNLOAD_OPT, opt);
      window.dispatchEvent(new Event(OPT_CHANGE_EVENT));
      onSave();
    },
    [onSave]
  );

  const [defaultOpt, setDefaultOpt] = React.useState<DownloadOpt>(load);

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

  return [defaultOpt, save] as const;
}

/**
 * Manage open/close state for the option dropdown menu.
 */
function useOptMenu() {
  const [optMenu, setOptMenu] = React.useState(false);
  const toggleOptMenu = React.useCallback(
    () => setOptMenu(!optMenu),
    [optMenu]
  );
  const closeOptMenu = React.useCallback(
    () => setOptMenu(false),
    []
  );

  const condHideDownloadOptMenu = React.useCallback(
      (evt: MouseEvent) => {
        if (!(evt.target as HTMLElement).closest('*[data-ignore-global-click]')) {
          closeOptMenu();
        }
      },
      [closeOptMenu]
    );

  React.useEffect(() => {
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
  }, [condHideDownloadOptMenu]);
  return [optMenu, toggleOptMenu, closeOptMenu] as const;
}


type CSVRowRecord = Record<string, unknown>;


interface UseDownloadButtonArgs<R extends RowRecord> {
  columnDefs: ColumnDef<unknown, R>[];
  sheetName: string;
  tableRef: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement | null>;
}

/**
 * Provide download and copy-to-clipboard helpers for a table element.
 *
 * @param columnDefs - Definitions describing each column in the table.
 * @param sheetName - Sheet name used when exporting to Excel.
 * @param tableRef - Ref to the table container element.
 * @returns Object containing the React element for the buttons and a flag
 *   indicating whether copy/export is in progress.
 */
export default function useDownloadButton<R extends RowRecord>({
  columnDefs,
  sheetName,
  tableRef
}: UseDownloadButtonArgs<R>) {

  const [copying, setCopying] = React.useState(false);

  const [optMenu, toggleOptMenu, closeOptMenu] = useOptMenu();

  const [defaultOpt, setDefaultOpt] = useDefaultDownloadOption({
    onSave: closeOptMenu
  });

  const readTableData = React.useCallback(
  async (): Promise<string[][]> => {
      setCopying(true);
      await sleep(600);
      try {
        const node = tableRef.current!.querySelector('table')! as HTMLTableElement;
        let header: string[] = [];
        const content: Array<CSVRowRecord> = [];
        const labels: string[] = [];
        for (const row of Array.from(node.rows)) {
          if (row.dataset.skipCopy) {
            continue;
          }
          if (row.parentElement?.tagName === 'THEAD') {
            for (let i = 0; i < columnDefs.length; i ++) {
              const cell = row.cells[i];
              const colDef = columnDefs[i];
              labels.push(colDef.exportLabel || cell.innerText);
            }
            continue;
          }
          const tr: CSVRowRecord = {};
          for (let i = 0; i < columnDefs.length; i ++) {
            const cell = row.cells[i];
            const colDef = columnDefs[i];
            const label = labels[i] || startCase(colDef.name);
            if (colDef.exportCell) {
              // columnDef can supply an "exportCell" method
              const payload = JSON.parse(row.dataset.payload || '{}') as R;
              const cellData = colDef.exportCell(
                payload[colDef.name as keyof R],
                payload
              );
              if (cellData instanceof Array) {
                for (const one of cellData) {
                  if (one && typeof one === 'object' && !Array.isArray(one)) {
                    const obj = one as Record<string, unknown>;
                    for (const key in obj) {
                      const val = obj[key];
                      if (key) {
                        tr[`${label}: ${key}`] = val;
                      }
                      else {
                        tr[label] = val;
                      }
                    }
                  }
                }
              }
              else if (cellData && typeof cellData === 'object') {
                const obj = cellData as Record<string, unknown>;
                for (const key in obj) {
                  const val = obj[key];
                  if (key) {
                    tr[`${label}: ${key}`] = val;
                  }
                  else {
                    tr[label] = val;
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
        const rows: string[][] = content.map(
          trmap => headerWithValue.map(
            field => `${trmap[field] ?? ''}`
          )
        );
        return [headerWithValue, ...rows];
      }
      finally {
        setCopying(false);
      }
    },
    [tableRef, columnDefs]
  );

  const handleCopy = React.useCallback(
    async (e: React.MouseEvent<HTMLElement> | null) => {
      e && e.preventDefault();
      const content = await readTableData();
      navigator.clipboard.writeText(dumpTSV(content));
      setDefaultOpt('copy-tsv');
    },
    [readTableData, setDefaultOpt]
  );

  const handleDownloadCSV = React.useCallback(
    async (e: React.MouseEvent<HTMLElement> | null) => {
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
    async (e: React.MouseEvent<HTMLElement> | null) => {
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
  } as const;
}
