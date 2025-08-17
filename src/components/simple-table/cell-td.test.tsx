import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import SimpleTableCellTd from './cell-td';
import style from './style.module.scss';

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

  it('handles empty values and column/row spans', () => {
    const columnDef = {
      name: 'foo',
      render: () => '',
      renderConfig: {},
      bodyCellColSpan: 2,
      textAlign: 'center',
      bodyCellStyle: {color: 'red'}
    } as const;
    const {container} = render(
      <table><tbody>
        <tr>
          <SimpleTableCellTd
           row={{foo: 'bar'}}
           rowSpan={3}
           rowContext={{}}
           columnDef={columnDef as any}
           enableRowSpan />
        </tr>
        <tr>
          <SimpleTableCellTd
           row={{foo: 'bar'}}
           rowSpan={0}
           rowContext={{}}
           columnDef={columnDef as any}
           enableRowSpan />
        </tr>
        <tr>
          <SimpleTableCellTd
           row={{foo: 'bar'}}
           rowSpan={1}
           rowContext={{}}
           columnDef={columnDef as any}
           enableRowSpan={false} />
        </tr>
      </tbody></table>
    );
    const tds = container.querySelectorAll('td');
    expect(tds[0]).toHaveAttribute('rowspan', '3');
    expect(tds[0]).toHaveAttribute('colspan', '2');
    expect(tds[0]).toHaveAttribute('data-is-empty');
    expect(tds[1]).toHaveClass(style.hide);
    expect(tds[2]).not.toHaveAttribute('rowspan');
  });
});
