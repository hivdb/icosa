import React from 'react';
import {describe, test, expect, vi, beforeEach} from 'vitest';

vi.mock('@apollo/client', () => ({useQuery: vi.fn()}));
vi.mock('../../../../src/components/cumu-query/use-result-cache', () => ({
  default: vi.fn()
}));
vi.mock('../../../../src/components/cumu-query/use-cursor-and-variables', () => ({
  default: vi.fn()
}));
vi.mock('../../../../src/components/cumu-query/use-fetch-another', () => ({
  default: vi.fn()
}));

import {useQuery} from '@apollo/client';
import useCumuQuery from '../../../../src/components/cumu-query';
import useResultCache from '../../../../src/components/cumu-query/use-result-cache';
import useCursorAndVariables from '../../../../src/components/cumu-query/use-cursor-and-variables';
import useFetchAnother from '../../../../src/components/cumu-query/use-fetch-another';

const mockUseQuery = vi.mocked(useQuery);
const mockUseResultCache = vi.mocked(useResultCache);
const mockUseCursorAndVariables = vi.mocked(useCursorAndVariables);
const mockUseFetchAnother = vi.mocked(useFetchAnother);

const mockCacheResults = vi.fn();
const mockRestoreResults = vi.fn();
const mockIsCached = vi.fn();
const mockSetCursor = vi.fn();
const mockIsCursorFulfilled = vi.fn();
const mockFetchAnother = vi.fn();

describe('useCumuQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResultCache.mockReturnValue({
      cacheResults: mockCacheResults,
      restoreResults: mockRestoreResults,
      isCached: mockIsCached
    });
    mockUseCursorAndVariables.mockReturnValue({
      cursor: {offset: 0, limit: 1},
      setCursor: mockSetCursor,
      fetchedCount: 1,
      fetchingCount: 0,
      variables: {items: []},
      isEmptyQuery: false,
      isCursorFulfilled: mockIsCursorFulfilled,
      getVariables: vi.fn()
    });
    mockUseFetchAnother.mockReturnValue(mockFetchAnother);
    mockRestoreResults.mockReturnValue({items: []});
  });

  test('returns expected structure when loaded successfully', () => {
    mockUseQuery.mockReturnValue({loading: false, error: undefined, data: {items: []}} as any);
    mockIsCursorFulfilled.mockReturnValue(true);

    const result = useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(result.loaded).toBe(true);
    expect(result.error).toBe(null);
    expect(result.fetchAnother).toBe(mockFetchAnother);
    expect(result.progressObj).toEqual({progress: 1, nextProgress: 1, total: 1});
    expect(result.cursor).toEqual({offset: 0, limit: 1});
    expect(mockCacheResults).toHaveBeenCalledWith({items: []});
  });

  test('returns error structure when query fails', () => {
    const error = new Error('GraphQL error') as any;
    mockUseQuery.mockReturnValue({loading: false, error, data: null} as any);
    mockIsCursorFulfilled.mockReturnValue(true);

    const result = useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(result.loaded).toBe(false);
    expect(result.error).toBe(error);
    expect(result.cursor).toBeUndefined();
    expect(mockCacheResults).not.toHaveBeenCalled();
  });

  test('does not cache results when error occurs', () => {
    const error = new Error('GraphQL error') as any;
    mockUseQuery.mockReturnValue({loading: false, error, data: {items: []}} as any);
    mockIsCursorFulfilled.mockReturnValue(true);

    useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(mockCacheResults).not.toHaveBeenCalled();
  });

  test('triggers reload when not loading and cursor not fulfilled', () => {
    mockUseQuery.mockReturnValue({loading: false, error: undefined, data: {items: []}} as any);
    mockIsCursorFulfilled.mockReturnValue(false);

    useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(mockSetCursor).toHaveBeenCalledWith({offset: 0, limit: 1});
  });

  test('does not trigger reload when loading', () => {
    mockUseQuery.mockReturnValue({loading: true, error: undefined, data: null} as any);
    mockIsCursorFulfilled.mockReturnValue(false);

    useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(mockSetCursor).not.toHaveBeenCalled();
  });

  test('removes mainInputName from extVariables', () => {
    mockUseQuery.mockReturnValue({loading: false, error: undefined, data: {items: []}} as any);
    mockIsCursorFulfilled.mockReturnValue(true);
    mockUseCursorAndVariables.mockReturnValue({
      cursor: {offset: 0, limit: 1},
      setCursor: mockSetCursor,
      fetchedCount: 1,
      fetchingCount: 0,
      variables: {items: [], otherVar: 'value'},
      isEmptyQuery: false,
      isCursorFulfilled: mockIsCursorFulfilled,
      getVariables: vi.fn()
    });

    const result = useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(result.extVariables).toEqual({otherVar: 'value'});
    expect(result.extVariables.items).toBeUndefined();
  });

  test('calculates progress correctly with fetchingCount', () => {
    mockUseQuery.mockReturnValue({loading: false, error: undefined, data: {items: []}} as any);
    mockIsCursorFulfilled.mockReturnValue(true);
    mockUseCursorAndVariables.mockReturnValue({
      cursor: {offset: 0, limit: 10},
      setCursor: mockSetCursor,
      fetchedCount: 5,
      fetchingCount: 3,
      variables: {items: []},
      isEmptyQuery: false,
      isCursorFulfilled: mockIsCursorFulfilled,
      getVariables: vi.fn()
    });

    const result = useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);

    expect(result.progressObj).toEqual({
      progress: 5,
      nextProgress: 8,
      total: 10
    });
  });
});

