import {render, screen, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect, vi} from 'vitest';
import React from 'react';

import SimpleTable, {ColumnDef} from './index';

describe('SimpleTable', () => {
  it('renders table with data', () => {
    const columnDefs = [
      new ColumnDef({name: 'name', label: 'Name'}),
      new ColumnDef({name: 'val', label: 'Val'})
    ];
    const data = [
      {name: 'Alice', val: 1},
      {name: 'Bob', val: 2}
    ];
    render(<SimpleTable data={data} columnDefs={columnDefs} cacheKey="1" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('supports row click and custom styling', () => {
    const columnDefs = [new ColumnDef({name: 'name', label: 'Name'})];
    const data = [{name: 'Alice'}];
    const onRowClick = vi.fn();
    render(
      <SimpleTable
       data={data}
       columnDefs={columnDefs}
       cacheKey="1"
       windowScroll
       compact
       lastCompact
       noHeaderOverlapping
       className="custom"
       tableScrollStyle={{height: 10}}
       tableStyle={{width: 20}}
       onRowClick={onRowClick}
       afterTable={<div>after</div>}
       disableCopy />
    );
    act(() => {
      screen.getByText('Alice').closest('tr')!.click();
    });
    expect(onRowClick).toHaveBeenCalled();
    expect(screen.getByText('after')).toBeInTheDocument();
    const container = document.querySelector('.custom__scroll') as HTMLElement;
    expect(container.style.height).toBe('10px');
  });
});
