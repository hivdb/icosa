import React from 'react';
import {render} from '@testing-library/react';
import {describe, test, expect, vi, beforeEach} from 'vitest';

const mockReplace = vi.fn();
const mockRouter = {
  match: {location: {query: {}}},
  router: {replace: mockReplace}
};

vi.mock('found', () => ({
  useRouter: () => mockRouter
}));

import useFetchAnother from '../../../../src/components/cumu-query/use-fetch-another';

function Wrapper({
  onReady,
  loaded,
  isCached = () => true,
  lazyLoad = false,
  inputObjs = [{name: 'a'}, {name: 'b'}],
  quickLoadLimit
}: {
  onReady: (api: any) => void;
  loaded: boolean;
  isCached?: (name: any) => boolean;
  lazyLoad?: boolean;
  inputObjs?: any[];
  quickLoadLimit?: number;
}) {
  const setCursor = vi.fn();
  const fetchAnother = useFetchAnother({
    inputObjs,
    loaded,
    isCached,
    setCursor,
    lazyLoad,
    quickLoadLimit,
    inputUniqKeyName: 'name'
  });
  React.useEffect(() => onReady({fetchAnother, setCursor}), [fetchAnother, setCursor, onReady]);
  return null;
}

describe('useFetchAnother', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('updates cursor when fetching another item', async () => {
    let api: any = null;
    render(<Wrapper loaded={false} onReady={h => {api = h;}} />);
    await api.fetchAnother('b');
    expect(api.setCursor).toHaveBeenCalledWith({offset: 0, limit: 2, loadFirstIndex: 1});
  });

  test('updates URL when updateCurrentSelected is true', async () => {
    let api: any = null;
    render(<Wrapper loaded={false} onReady={h => {api = h;}} />);
    await api.fetchAnother('b', true);
    expect(mockReplace).toHaveBeenCalledWith({
      query: {name: 'b'}
    });
  });

  test('does not update URL when updateCurrentSelected is false', async () => {
    let api: any = null;
    render(<Wrapper loaded={false} onReady={h => {api = h;}} />);
    await api.fetchAnother('b', false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('logs error when item not found', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let api: any = null;
    render(<Wrapper loaded={false} onReady={h => {api = h;}} />);
    const result = api.fetchAnother('nonexistent');
    expect(result).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Given item "nonexistent" not found, this is no doubt a bug'
    );
    consoleErrorSpy.mockRestore();
  });

  test('resolves immediately when all items are cached', async () => {
    let api: any = null;
    render(<Wrapper loaded={false} isCached={() => true} onReady={h => {api = h;}} />);
    const promise = api.fetchAnother('b');
    await expect(promise).resolves.toBeUndefined();
  });

  test('waits for loaded when items not cached', async () => {
    let api: any = null;
    const {rerender} = render(<Wrapper loaded={false} isCached={() => false} onReady={h => {api = h;}} />);
    const promise = api.fetchAnother('b');

    // Promise should not resolve yet
    let resolved = false;
    promise.then(() => {resolved = true;});
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(resolved).toBe(false);

    // Rerender with loaded=true
    rerender(<Wrapper loaded={true} isCached={() => false} onReady={h => {api = h;}} />);
    await promise;
    expect(resolved).toBe(true);
  });

  test('uses lazy load settings', async () => {
    let api: any = null;
    render(<Wrapper
      loaded={false}
      lazyLoad={true}
      quickLoadLimit={3}
      onReady={h => {api = h;}}
      inputObjs={[{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}, {name: 'e'}]}
    />);
    await api.fetchAnother('c');
    // With quickLoadLimit=3 and offset=2, should center around index 2
    expect(api.setCursor).toHaveBeenCalledWith({offset: 1, limit: 3, loadFirstIndex: 2});
  });

  test('resolves pending promise when component becomes loaded', async () => {
    let api: any = null;
    const {rerender} = render(<Wrapper loaded={false} isCached={() => false} onReady={h => {api = h;}} />);

    const promise1 = api.fetchAnother('a');
    const promise2 = api.fetchAnother('b');

    // Both promises should be pending
    let resolved1 = false;
    let resolved2 = false;
    promise1.then(() => {resolved1 = true;});
    promise2.then(() => {resolved2 = true;});

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(resolved1).toBe(false);

    // Only the latest promise should resolve when loaded
    rerender(<Wrapper loaded={true} isCached={() => false} onReady={h => {api = h;}} />);
    await promise2;
    expect(resolved2).toBe(true);
  });
});

