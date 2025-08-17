import {render, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('sleep-promise', () => ({default: () => Promise.resolve()}));

import SimpleTableCellTh from './cell-th';
import {applySorts} from './cell-th';

describe('SimpleTableCellTh', () => {
  it('calls onSort when clicked', async () => {
    const onBeforeSort = vi.fn();
    const onSort = vi.fn();
    const columnDef = {
      name: 'a',
      label: 'A',
      sort: (rows: any[]) => rows.sort((x, y) => (x.a > y.a ? 1 : -1)),
      sortable: true,
      nullsLast: false,
      headCellStyle: {}
    };
    const data = [{a: 2}, {a: 1}];
    let sortState: any = {columns: [], sortedData: data};
    const {getByText} = render(
      <table><thead><tr>
        <SimpleTableCellTh
         data={data}
         columnDef={columnDef as any}
         sortState={sortState as any}
         onBeforeSort={onBeforeSort}
         onSort={onSort} />
      </tr></thead></table>
    );
    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => expect(onSort).toHaveBeenCalled());
  });

  it('cycles sort directions and handles nulls last and reset', async () => {
    const onSort = vi.fn();
    const data = [
      {a: 2, b: null},
      {a: 1, b: 2},
      {a: 3, b: 1}
    ];
    const sortState: any = {columns: [], sortedData: data};
    const colA = {
      name: 'a',
      label: 'A',
      sort: (rows: any[]) => rows.slice().sort((x, y) => x.a - y.a),
      sortable: true,
      nullsLast: false,
      headCellStyle: {}
    };
    const colB = {
      name: 'b',
      label: 'B',
      sort: (rows: any[]) => rows.slice().sort((x, y) => (x.b ?? 0) - (y.b ?? 0)),
      sortable: true,
      nullsLast: true,
      headCellStyle: {}
    };
    const {getByText} = render(
      <table><thead><tr>
        <SimpleTableCellTh
         data={data}
         columnDef={colA as any}
         sortState={sortState as any}
         onSort={newState => { // @ts-ignore test state mutation
            // @ts-ignore
            sortState.columns = newState.columns;
            // @ts-ignore
            sortState.sortedData = newState.sortedData; onSort(newState);}} />
        <SimpleTableCellTh
         data={data}
         columnDef={colB as any}
         sortState={sortState as any}
         onSort={newState => { // @ts-ignore test state mutation
            // @ts-ignore
            sortState.columns = newState.columns;
            // @ts-ignore
            sortState.sortedData = newState.sortedData; onSort(newState);}} />
      </tr></thead></table>
    );

    // sort column B ascending (nulls should move last)
    fireEvent.click(getByText('B').closest('th')!);
    await waitFor(() => expect(onSort).toHaveBeenCalledTimes(1));
    expect(sortState.sortedData[2].b).toBeNull();

    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => expect(onSort).toHaveBeenCalledTimes(2));
    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => expect(onSort).toHaveBeenCalledTimes(3));

    // double click to reset A
    fireEvent.doubleClick(getByText('A').closest('th')!);
    // @ts-ignore test check
    await waitFor(() => expect(sortState.columns.find(c => c.name === 'a')).toBeUndefined());
  });

  it('reverses previous sort when a column becomes descending and cycles off', async () => {
    const data = [
      {a: 1, b: 2},
      {a: 2, b: 1}
    ];
    const sortState: any = {columns: [], sortedData: data};
    const colA = {
      name: 'a',
      label: 'A',
      sort: (rows: any[]) => rows.slice().sort((x, y) => x.a - y.a),
      sortable: true,
      nullsLast: false,
      headCellStyle: {}
    };
    const colB = {
      name: 'b',
      label: 'B',
      sort: (rows: any[]) => rows.slice().sort((x, y) => x.b - y.b),
      sortable: true,
      nullsLast: false,
      headCellStyle: {}
    };
    const {getByText} = render(
      <table><thead><tr>
        <SimpleTableCellTh
         data={data}
         columnDef={colA as any}
         sortState={sortState as any}
         onSort={newState => {
           // @ts-ignore mutate for test
           sortState.columns = newState.columns;
           // @ts-ignore
           sortState.sortedData = newState.sortedData;
         }} />
        <SimpleTableCellTh
         data={data}
         columnDef={colB as any}
         sortState={sortState as any}
         onSort={newState => {
           // @ts-ignore mutate for test
           sortState.columns = newState.columns;
           // @ts-ignore
           sortState.sortedData = newState.sortedData;
         }} />
      </tr></thead></table>
    );

    // A ascending
    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => sortState.columns.length === 1);
    // B ascending
    fireEvent.click(getByText('B').closest('th')!);
    await waitFor(() => sortState.columns.length === 2);
    // A descending
    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => sortState.columns[0]?.direction === 'descending');
    // A unsorted
    fireEvent.click(getByText('A').closest('th')!);
    await waitFor(() => (sortState.columns as any).find((c: any) => c.name === 'a') === undefined);
  });

  it('applies sorts with descending precedence', () => {
    const data = [
      {a: 1, b: 2},
      {a: 2, b: 1}
    ];
    const columns = [
      {
        name: 'b',
        sort: (rows: any[]) => rows.slice().sort((x, y) => x.b - y.b),
        direction: 'ascending',
        nullsLast: false
      },
      {
        name: 'a',
        sort: (rows: any[]) => rows.slice().sort((x, y) => x.a - y.a),
        direction: 'descending',
        nullsLast: false
      }
    ];
    const result = applySorts(data, columns as any);
    expect(result[0].a).toBe(2);
  });
});
