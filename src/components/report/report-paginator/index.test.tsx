import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import useReportPaginator from './index';
import useScrollObserver from '../../../utils/use-scroll-observer';

vi.mock('../../../utils/use-scroll-observer', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    onObserve: vi.fn(),
    onDisconnect: vi.fn(),
    scrollTo: vi.fn()
  }))
}));

describe('useReportPaginator', () => {
  it('invokes scrollTo on selection', () => {
    const scrollTo = vi.fn();
    (useScrollObserver as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      onObserve: vi.fn(),
      onDisconnect: vi.fn(),
      scrollTo
    });

    const {result} = renderHook(() =>
      useReportPaginator({
        inputObjs: [{name: 'a'}],
        loaded: true,
        output: '',
        currentSelected: {index: 0, name: 'a'},
        fetchAnother: vi.fn().mockResolvedValue(undefined),
        children: null
      })
    );

    act(() => {
      result.current.paginator.props.onSelect('a');
    });

    expect(scrollTo).toHaveBeenCalled();
  });
});

