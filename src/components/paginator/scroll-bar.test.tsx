import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeAll} from 'vitest';
import '@testing-library/jest-dom';

import ScrollBar from './scroll-bar';

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '10'
  } as any);
});

describe('ScrollBar', () => {
  it('calls onScroll when clicked', () => {
    const onScroll = vi.fn();
    const {container} = render(<ScrollBar onScroll={onScroll} />);
    const div = container.firstChild as HTMLElement;
    fireEvent.mouseDown(div, {clientX: 5});
    expect(onScroll).toHaveBeenCalled();
  });
});
