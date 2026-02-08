import React from 'react';
import {render} from '@testing-library/react';
import {describe, test, expect} from 'vitest';

import useCursorAndVariables from '../../../../src/components/cumu-query/use-cursor-and-variables';

function Wrapper({
  onReady,
  ...props
}: {
  onReady: (hooks: ReturnType<typeof useCursorAndVariables>) => void;
  initOffset?: number;
  initLimit?: number;
  isCached?: (key: any) => boolean;
  inputObjs?: any[];
  currentSelected?: {index: number};
  inputUniqKeyName?: string;
  mainInputName?: string;
  maxPerRequest?: number;
  onExtendVariables?: (v: any) => any;
}) {
  const hooks = useCursorAndVariables({
    initOffset: 0,
    initLimit: 2,
    isCached: () => false,
    inputObjs: [{id: 1}, {id: 2}, {id: 3}],
    currentSelected: {index: 0},
    inputUniqKeyName: 'id',
    mainInputName: 'items',
    maxPerRequest: 2,
    onExtendVariables: v => v,
    ...props
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

  test('loads first index when not cached', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      currentSelected={{index: 2}}
      initOffset={2}
      initLimit={2}
      isCached={() => false}
      maxPerRequest={2}
    />);
    // Should load from index 2 first since it's not cached, but only 1 item available
    expect(state!.variables.items).toHaveLength(1);
    expect(state!.variables.items[0].id).toBe(3); // index 2
  });

  test('skips loadFirstIndex when already cached', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    const isCached = (key: any) => key === 3; // id 3 is cached
    render(<Wrapper 
      onReady={h => {state = h;}}
      currentSelected={{index: 2}}
      initOffset={0}
      initLimit={2}
      isCached={isCached}
    />);
    // Should load from offset 0 since loadFirstIndex is cached
    expect(state!.variables.items).toHaveLength(2);
    expect(state!.variables.items[0].id).toBe(1); // index 0
  });

  test('throws error when loadFirstIndex is out of bounds', () => {
    expect(() => {
      render(<Wrapper 
        onReady={() => {}}
        currentSelected={{index: 10}}
        inputObjs={[{id: 1}, {id: 2}]}
      />);
    }).toThrow('InputObjs index out of bound: loadFirstIndex=10');
  });

  test('counts fetched items correctly', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    const isCached = (key: any) => key === 1; // id 1 is cached
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={isCached}
      initOffset={0}
      initLimit={3}
    />);
    expect(state!.fetchedCount).toBe(1);
    expect(state!.fetchingCount).toBe(2);
  });

  test('respects maxPerRequest limit', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={() => false}
      initOffset={0}
      initLimit={5}
      maxPerRequest={2}
      inputObjs={[{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}]}
    />);
    expect(state!.variables.items).toHaveLength(2); // maxPerRequest
    expect(state!.fetchingCount).toBe(2);
  });

  test('stops at end of inputObjs', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={() => false}
      initOffset={0}
      initLimit={10}
      maxPerRequest={10}
      inputObjs={[{id: 1}, {id: 2}, {id: 3}]}
    />);
    expect(state!.variables.items).toHaveLength(3);
  });

  test('isCursorFulfilled returns true when all items cached', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={() => true}
      initOffset={0}
      initLimit={2}
    />);
    expect(state!.isCursorFulfilled()).toBe(true);
  });

  test('isCursorFulfilled returns false when items not cached', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={() => false}
      initOffset={0}
      initLimit={2}
    />);
    expect(state!.isCursorFulfilled()).toBe(false);
  });

  test('onExtendVariables is called with variables', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    const onExtendVariables = (v: any) => ({...v, extra: 'value'});
    render(<Wrapper 
      onReady={h => {state = h;}}
      onExtendVariables={onExtendVariables}
    />);
    expect(state!.variables.extra).toBe('value');
  });

  test('isEmptyQuery is true when no items to fetch', () => {
    let state: ReturnType<typeof useCursorAndVariables> | null = null;
    render(<Wrapper 
      onReady={h => {state = h;}}
      isCached={() => true}
      initOffset={0}
      initLimit={2}
    />);
    expect(state!.isEmptyQuery).toBe(true);
  });
});

