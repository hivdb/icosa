import {render, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./style.module.scss', () => ({default: {'th-container': 'th-container', label: 'label', 'sort-icon': 'sort-icon'}}));
vi.mock('sleep-promise', () => ({default: () => Promise.resolve()}));

import SimpleTableCellTh from './cell-th';

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
    const sortState = {columns: [], sortedData: data};
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
});
