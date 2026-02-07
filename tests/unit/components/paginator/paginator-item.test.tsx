import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import PaginatorItem from '../../../../src/components/paginator/paginator-item';

describe('PaginatorItem', () => {
  it('handles mouse enter and leave', () => {
    const setHover = vi.fn();
    const {getByText} = render(
      <ul>
        <PaginatorItem
         index={0}
         name="test"
         isSelected={false}
         isHovering={false}
         setCurrentHovering={setHover}
         href="#">
          Item
        </PaginatorItem>
      </ul>
    );
    const item = getByText('Item');
    fireEvent.mouseEnter(item.closest('li')!);
    fireEvent.mouseLeave(item.closest('li')!);
    expect(setHover).toHaveBeenCalledWith('test');
    expect(setHover).toHaveBeenCalledWith(null);
  });
});
