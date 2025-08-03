import React from 'react';
import {render} from '@testing-library/react';
import {describe, test, expect} from 'vitest';

import useCursorAndVariables from './use-cursor-and-variables';

function Wrapper({onReady}: {onReady: (hooks: ReturnType<typeof useCursorAndVariables>) => void}) {
  const hooks = useCursorAndVariables({
    initOffset: 0,
    initLimit: 2,
    isCached: () => false,
    inputObjs: [{id: 1}, {id: 2}, {id: 3}],
    currentSelected: {index: 0},
    inputUniqKeyName: 'id',
    mainInputName: 'items',
    maxPerRequest: 2,
    onExtendVariables: v => v
  });
  React.useEffect(() => onReady(hooks), [hooks, onReady]);
  return null;
}

describe('useCursorAndVariables', () => {
  test('generates variables and checks fulfillment', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper onReady={h => {state = h;}} />);
    expect(state!.variables.items).toHaveLength(2);
    expect(state!.isCursorFulfilled()).toBe(false);
  });
});

