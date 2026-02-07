import React from 'react';
import {describe, test, expect, vi} from 'vitest';

vi.mock('@apollo/client', () => ({useQuery: vi.fn()}));
vi.mock('../../../../src/components/cumu-query/use-result-cache', () => ({
  default: vi.fn(() => ({
    cacheResults: vi.fn(),
    restoreResults: vi.fn(() => ({items: []})),
    isCached: vi.fn()
  }))
}));
vi.mock('../../../../src/components/cumu-query/use-cursor-and-variables', () => ({
  default: vi.fn(() => ({
    cursor: {offset: 0, limit: 1},
    setCursor: vi.fn(),
    fetchedCount: 1,
    fetchingCount: 0,
    variables: {items: []},
    isEmptyQuery: false,
    isCursorFulfilled: vi.fn(() => true)
  }))
}));
vi.mock('../../../../src/components/cumu-query/use-fetch-another', () => ({
  default: vi.fn(() => 'fetchAnother')
}));

import {useQuery} from '@apollo/client';
import useCumuQuery from '../../../../src/components/cumu-query';

describe('useCumuQuery', () => {
  test('returns expected structure', () => {
    (useQuery as any).mockReturnValue({loading: false, error: null, data: {items: []}});
    const result = useCumuQuery({query: {}, client: {}, mainInputName: 'items'} as any);
    expect(result.loaded).toBe(true);
    expect(result.fetchAnother).toBe('fetchAnother');
    expect(result.progressObj.total).toBe(1);
  });
});

