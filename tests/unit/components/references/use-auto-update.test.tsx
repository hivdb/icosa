import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReferenceContext from '../../../../src/components/references/reference-context';
import useAutoUpdate from '../../../../src/components/references/use-auto-update';

describe('useAutoUpdate', () => {
  it('registers listener and forces re-render on update', () => {
    let updateListener: (() => void) | undefined;
    const context = {
      listenOnUpdate: (cb: () => void) => {
        updateListener = cb;
      }
    } as any;

    let renderCount = 0;
    function Component() {
      renderCount += 1;
      useAutoUpdate();
      return <div>count:{renderCount}</div>;
    }

    render(
      <ReferenceContext.Provider value={context}>
        <Component />
      </ReferenceContext.Provider>
    );

    expect(renderCount).toBe(1);
    act(() => {
      updateListener && updateListener();
    });
    expect(renderCount).toBe(2);
  });
});
