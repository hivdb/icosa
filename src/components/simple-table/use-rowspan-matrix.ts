import React from 'react';
import nestGet from 'lodash/get';
import type {RowRecord, RowSpanKeyGetter} from './types';


/**
 * Count how many groups exist based on the given key getter.
 */
function countGroups(rows: RowRecord[], rowSpanKeyGetter: RowSpanKeyGetter) {
  let numGroups = 0;
  let prevRow: RowRecord | undefined;
  let prevName: string | undefined;
  for (const row of rows) {
    let curName: string | undefined;
    if (prevRow && rowSpanKeyGetter(prevRow) === rowSpanKeyGetter(row)) {
      curName = prevName;
    }
    else {
      curName = rowSpanKeyGetter(row);
      numGroups ++;
    }
    prevRow = row;
    prevName = curName;
  }
  return numGroups;
}

interface RowSpanColumn {
  name: string;
  rowSpanKeyGetter: RowSpanKeyGetter;
  idx: number;
  allNumRows?: number[];
  subGroups?: RowSpanGroup[];
}

interface RowSpanGroup {
  colName: string;
  colIdx: number;
  rowIdxOffset: number;
  allNumRows: number[];
  subGroups?: RowSpanGroup[];
}

function groupByColumns(
  rows: RowRecord[],
  columns: RowSpanColumn[],
  rowIdxOffset = 0
): RowSpanGroup {
  const {name, rowSpanKeyGetter, idx} = columns.shift()!;
  const groups: RowRecord[][] = [];
  let prevRow: RowRecord | undefined;
  let prevGroup: RowRecord[] | undefined;
  for (const row of rows) {
    let curGroup: RowRecord[];
    if (
      prevRow &&
      rowSpanKeyGetter(prevRow) === rowSpanKeyGetter(row)
    ) {
      prevGroup!.push(row);
      curGroup = prevGroup!;
    }
    else {
      curGroup = [row];
      groups.push(curGroup);
    }
    prevRow = row;
    prevGroup = curGroup;
  }
  if (columns.length === 0) {
    return {
      colName: name,
      colIdx: idx,
      rowIdxOffset,
      allNumRows: groups.map(group => group.length)
    };
  }
  else {
    const subGroups: RowSpanGroup[] = [];
    let subGroupRowIdxOffset = rowIdxOffset;
    for (const subRows of groups) {
      subGroups.push(groupByColumns(
        subRows,
        [...columns],
        subGroupRowIdxOffset
      ));
      subGroupRowIdxOffset += subRows.length;
    }
    return {
      colName: name,
      colIdx: idx,
      rowIdxOffset,
      allNumRows: subGroups.map(
        ({allNumRows}) => allNumRows.reduce((acc, numRows) => acc + numRows, 0)
      ),
      subGroups
    };
  }
}

interface UseRowSpanMatrixArgs {
  columnDefs: Array<{
    name: string;
    rowSpanKey?: string;
    rowSpanKeyGetter?: RowSpanKeyGetter;
    multiCells?: boolean;
  }>;
  data: RowRecord[];
}

/**
 * Calculate a rowspan matrix used to merge neighbouring cells.
 *
 * @param columnDefs - Definitions describing each column including rowspan
 *   behavior.
 * @param data - Table row data.
 * @returns Matrix of rowspan values matching the table shape.
 */
export default function useRowSpanMatrix({
  columnDefs,
  data
}: UseRowSpanMatrixArgs) {
  return React.useMemo<number[][]>(
    () => {
      const matrix = new Array(data.length).fill(1)
        .map(() => new Array(columnDefs.length).fill(1));

      const rowSpanColumns = columnDefs
        .map(({
          name,
          rowSpanKey,
          rowSpanKeyGetter,
          multiCells
        }, idx) => {
          const getter: RowSpanKeyGetter = rowSpanKeyGetter ? rowSpanKeyGetter : (
            rowSpanKey ?
              (row: RowRecord) => nestGet(row, rowSpanKey) :
              (row: RowRecord) => nestGet(row, name)
          );
          return {
            name,
            rowSpanKeyGetter: getter,
            multiCells,
            numGroups: countGroups(data, getter),
            idx
          };
        })
        .filter(({multiCells}) => !multiCells)
        .sort(({numGroups: a}, {numGroups: b}) => a - b);

      if (rowSpanColumns.length === columnDefs.length) {
        return matrix;
      }

      let curGroup: RowSpanGroup | null = groupByColumns(data, rowSpanColumns as RowSpanColumn[]);
      const groupStack: RowSpanGroup[] = [];
      do {
        const subGroups: RowSpanGroup[] | undefined = curGroup!.subGroups;
        if (subGroups && subGroups.length > 0) {
          groupStack.push(curGroup!);
          curGroup = subGroups.shift()!;
        }
        else {
          const {colIdx, rowIdxOffset, allNumRows} = curGroup!;
          let curRowIdx = rowIdxOffset;
          for (const numRows of allNumRows) {
            matrix[curRowIdx][colIdx] = numRows;
            for (let offset = 1; offset < numRows; offset ++) {
              matrix[curRowIdx + offset][colIdx] = 0;
            }
            curRowIdx += numRows;
          }
          if (groupStack.length > 0) {
            curGroup = groupStack.pop()!;
          }
          else {
            curGroup = null;
          }
        }
      } while (curGroup);
      return matrix;
    },
    [columnDefs, data]
  );
}
