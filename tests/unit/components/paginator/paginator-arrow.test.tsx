import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import usePaginatorArrow from '../../../../src/components/paginator/paginator-arrow';
import type {PaginatorChildItem} from '../../../../src/components/paginator/funcs';

describe('PaginatorArrow', () => {
  it('triggers child onClick when arrow clicked', () => {
    const items: PaginatorChildItem[] = [
      {name: 'a', onClick: vi.fn()},
      {name: 'b', onClick: vi.fn()}
    ];
    function Wrapper() {
      const {forwardArrow} = usePaginatorArrow({
        currentSelected: 'a',
        childItems: items,
        onScroll: vi.fn()
      });
      return <>{forwardArrow}</>;
    }
    const {getByText} = render(<Wrapper />);
    fireEvent.click(getByText('Next'));
    expect((items[1].onClick as any)).toHaveBeenCalled();
  });
});
