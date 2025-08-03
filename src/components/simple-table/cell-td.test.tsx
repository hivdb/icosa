import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./style.module.scss', () => ({default: {hide: 'hide', 'cell-value': 'cell-value'}}));

import SimpleTableCellTd from './cell-td';

describe('SimpleTableCellTd', () => {
  it('renders cell value', () => {
    const columnDef = {
      name: 'foo',
      render: (val: any) => val,
      renderConfig: {},
      bodyCellColSpan: 1,
      textAlign: 'left',
      bodyCellStyle: {}
    };
    const {getByText} = render(
      <table><tbody><tr>
        <SimpleTableCellTd
         row={{foo: 'bar'}}
         rowSpan={1}
         rowContext={{}}
         columnDef={columnDef as any}
         enableRowSpan />
      </tr></tbody></table>
    );
    expect(getByText('bar')).toBeInTheDocument();
  });
});
