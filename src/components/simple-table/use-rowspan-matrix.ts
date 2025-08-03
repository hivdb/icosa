import React from 'react';
import nestGet from 'lodash/get';

type KeyGetter = (row: any) => any;

/**
 * Count how many groups exist based on the given key getter.
 */
function countGroups(rows: any[], rowSpanKeyGetter: KeyGetter) {
  let numGroups = 0;
  let prevRow: any;
  let prevName: any;
  for (const row of rows) {
    let curName;
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
  rowSpanKeyGetter: KeyGetter;
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
  rows: any[],
  columns: RowSpanColumn[],
  rowIdxOffset = 0
): RowSpanGroup {
  const {name, rowSpanKeyGetter, idx} = columns.shift()!;
  const groups: any[][] = [];
  let prevRow: any;
  let prevGroup: any[] | undefined;
  for (const row of rows) {
    let curGroup: any[];
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
    rowSpanKeyGetter?: KeyGetter;
    multiCells?: boolean;
  }>;
  data: any[];
}

/**
 * Calculate a rowspan matrix used to merge neighbouring cells.
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
          const getter: KeyGetter = rowSpanKeyGetter ? rowSpanKeyGetter : (
            rowSpanKey ?
              (row: any) => nestGet(row, rowSpanKey) :
              (row: any) => nestGet(row, name)
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

      let curGroup: RowSpanGroup | null = groupByColumns(data, rowSpanColumns as any);
      const groupStack: RowSpanGroup[] = [];
      do {
        const {subGroups} = curGroup!;
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
