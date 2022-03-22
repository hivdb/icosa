import React from 'react';
import nestGet from 'lodash/get';


function countGroups(rows, rowSpanKeyGetter) {
  let numGroups = 0;
  let prevRow;
  let prevName;
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


function groupByColumns(rows, columns, rowIdxOffset = 0) {
  const {name, rowSpanKeyGetter, idx} = columns.shift();
  const groups = [];
  let prevRow;
  let prevGroup;
  for (const row of rows) {
    let curGroup;
    if (
      prevRow &&
      rowSpanKeyGetter(prevRow) === rowSpanKeyGetter(row)
    ) {
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
  if (columns.length === 0) {
    return {
      colName: name,
      colIdx: idx,
      rowIdxOffset,
      allNumRows: groups.map(group => group.length)
    };
  }
  else {
    const subGroups = [];
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


export default function useRowSpanMatrix({
  columnDefs,
  data
}) {

  return React.useMemo(
    () => {
      const matrix = new Array(data.length).fill(1)
        .map(
          () => new Array(columnDefs.length).fill(1)
        );

      const rowSpanColumns = columnDefs
        .filter(({multiCells}) => !multiCells)
        .map(({
          name,
          rowSpanKey,
          rowSpanKeyGetter,
          multiCells
        }, idx) => {
          rowSpanKeyGetter = rowSpanKeyGetter ? rowSpanKeyGetter : (
            rowSpanKey ?
              row => nestGet(row, rowSpanKey) :
              row => nestGet(row, name)
          );
          return {
            name,
            rowSpanKey,
            rowSpanKeyGetter,
            multiCells,
            numGroups: countGroups(data, rowSpanKeyGetter),
            idx
          };
        })
        .sort(({numGroups: a}, {numGroups: b}) => a - b);

      if (rowSpanColumns.length === columnDefs.length) {
        return matrix;
      }

      let curGroup = groupByColumns(data, rowSpanColumns);
      const groupStack = [];
      do {
        const {subGroups} = curGroup;
        if (subGroups && subGroups.length > 0) {
          groupStack.push(curGroup);
          curGroup = subGroups.shift();
        }
        else {
          const {colIdx, rowIdxOffset, allNumRows} = curGroup;
          let curRowIdx = rowIdxOffset;
          for (const numRows of allNumRows) {
            matrix[curRowIdx][colIdx] = numRows;
            for (let offset = 1; offset < numRows; offset ++) {
              matrix[curRowIdx + offset][colIdx] = 0;
            }
            curRowIdx += numRows;
          }
          if (groupStack.length > 0) {
            curGroup = groupStack.pop();
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
