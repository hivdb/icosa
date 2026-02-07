import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';
import React from 'react';

import SimpleTable, {ColumnDef} from '../../../../src/components/simple-table';

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
});
