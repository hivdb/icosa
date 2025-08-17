import React from 'react';
import {render} from '@testing-library/react';
import {describe, test, expect} from 'vitest';

import useResultCache from './use-result-cache';

function Wrapper({onReady}: {onReady: (hooks: ReturnType<typeof useResultCache>) => void}) {
  const hooks = useResultCache({
    inputObjs: [],
    mainOutputName: 'items',
    outputUniqKeyName: 'id'
  });
  React.useEffect(() => onReady(hooks), [hooks, onReady]);
  return null;
}

describe('useResultCache', () => {
  test('caches and restores results', () => {
    let cached: ReturnType<typeof useResultCache> | null = null;
    render(<Wrapper onReady={h => {cached = h;}} />);
    const data = {items: [{id: 'a'}], misc: 1};
    cached!.cacheResults(data);
    expect(cached!.isCached('a')).toBe(true);
    expect(cached!.restoreResults()).toMatchObject({items: [{id: 'a'}], misc: 1});
  });
});

