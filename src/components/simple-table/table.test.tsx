import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect, vi} from 'vitest';
import React from 'react';

vi.mock('sleep-promise', () => ({default: () => Promise.resolve()}));

import SimpleTableTable from './table';
import ColumnDef from './column-def';
import style from './style.module.scss';

describe('SimpleTableTable', () => {
  it('renders rows, applies props, and handles row clicks', () => {
    const columnDefs = [
      new ColumnDef({name: 'name', label: 'Name'}),
      new ColumnDef({name: 'val', label: 'Val'})
    ];
    const data = [
      {name: 'Alice', val: 1},
      {name: 'Bob', val: 2}
    ];
    const onRowClick = vi.fn();
    render(
      <SimpleTableTable
        data={data}
        columnDefs={columnDefs}
        onRowClick={onRowClick}
        getRowKey={row => row.name}
        color="blue"
        className="custom-table"
        tableStyle={{border: '1px solid red'}}
      />
    );

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-color', 'blue');
    expect(table).toHaveClass('custom-table');
    expect(table).toHaveStyle({border: '1px solid red'});

    const aliceRow = screen.getByText('Alice').closest('tr')!;
    fireEvent.click(aliceRow);
    expect(onRowClick).toHaveBeenCalledWith(data[0], 0, expect.anything());
    expect(aliceRow).toHaveAttribute('data-payload', JSON.stringify(data[0]));
  });

  it('sorts data and triggers callbacks', async () => {
    const columnDefs = [
      new ColumnDef({name: 'name', label: 'Name'}),
      new ColumnDef({name: 'val', label: 'Val'})
    ];
    const data = [
      {name: 'Alice', val: 2},
      {name: 'Bob', val: 1}
    ];
    const onBeforeSort = vi.fn();
    const onSort = vi.fn();
    render(
      <SimpleTableTable
        data={data}
        columnDefs={columnDefs}
        onBeforeSort={onBeforeSort}
        onSort={onSort}
      />
    );

    const valHeader = screen.getByText('Val').closest('th')!;
    fireEvent.click(valHeader);

    await waitFor(() => expect(onSort).toHaveBeenCalled());
    expect(onBeforeSort).toHaveBeenCalled();

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[2];
    expect(firstDataRow).toHaveTextContent('Bob');
  });

  it('respects enableRowSpan flag', () => {
    const columnDefs = [
      new ColumnDef({name: 'group', label: 'Group', rowSpanKey: 'group'}),
      new ColumnDef({name: 'val', label: 'Val', multiCells: true})
    ];
    const data = [
      {group: 'A', val: 1},
      {group: 'A', val: 2},
      {group: 'B', val: 3}
    ];

    const {rerender} = render(
      <SimpleTableTable data={data} columnDefs={columnDefs} />
    );

    const firstCell = screen.getAllByRole('cell')[0];
    expect(firstCell).toHaveAttribute('rowspan', '2');

    rerender(
      <SimpleTableTable
        data={data}
        columnDefs={columnDefs}
        enableRowSpan={false}
      />
    );

    const cellsAfter = screen.getAllByRole('cell');
    expect(cellsAfter[0]).not.toHaveAttribute('rowspan');
    expect(cellsAfter[2]).not.toHaveClass(style.hide);
  });

  it('renders loader row in the header', () => {
    const columnDefs = [
      new ColumnDef({name: 'name', label: 'Name'})
    ];

    render(
      <SimpleTableTable data={[{name: 'Alice'}]} columnDefs={columnDefs} />
    );

    const loaderRow = screen.getByRole('row', {name: ''});
    expect(loaderRow).toHaveAttribute('data-skip-copy');
  });
});
