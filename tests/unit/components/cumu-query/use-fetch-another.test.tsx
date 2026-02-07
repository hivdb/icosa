import React from 'react';
import {render} from '@testing-library/react';
import {describe, test, expect, vi} from 'vitest';

vi.mock('found', () => ({
  useRouter: () => ({
    match: {location: {query: {}}},
    router: {replace: vi.fn()}
  })
}));

import useFetchAnother from '../../../../src/components/cumu-query/use-fetch-another';

function Wrapper({onReady, loaded}: {onReady: (api: any) => void; loaded: boolean}) {
  const setCursor = vi.fn();
  const fetchAnother = useFetchAnother({
    inputObjs: [{name: 'a'}, {name: 'b'}],
    loaded,
    isCached: () => true,
    setCursor,
    lazyLoad: false,
    inputUniqKeyName: 'name'
  });
  React.useEffect(() => onReady({fetchAnother, setCursor}), [fetchAnother, setCursor, onReady]);
  return null;
}

describe('useFetchAnother', () => {
  test('updates cursor when fetching another item', async () => {
    let api: any = null;
    render(<Wrapper loaded={false} onReady={h => {api = h;}} />);
    await api.fetchAnother('b');
    expect(api.setCursor).toHaveBeenCalledWith({offset: 0, limit: 2, loadFirstIndex: 1});
  });
});

