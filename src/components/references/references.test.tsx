import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import References, { ReferenceContext, useReference } from './index';
import InlineRef from './inline-reference';
import LoadReferences from './load-references';
import RefDefinition from './reference-definition';

function Provider({ children }: { children: React.ReactNode }) {
  const refObj = useReference(undefined, 'test');
  return (
    <ReferenceContext.Provider value={refObj!}>{children}</ReferenceContext.Provider>
  );
}

describe('references components', () => {
  it('registers and renders inline and list references', async () => {
    render(
      <Provider>
        <InlineRef
          authors="Doe"
          year="2020"
          title="Study"
          journal="J"
          url="http://example.com"
        />
        <References />
      </Provider>
    );
    await waitFor(() => screen.getAllByText(/Study/));
    const items = screen.getAllByText(/Study/);
    expect(items.length).toBeGreaterThan(0);
  });

  it('calls onLoad when LoadReferences has no loader', () => {
    const onLoad = vi.fn();
    const context = {
      getAllReferences: vi.fn(() => []),
      setReference: vi.fn(),
      setLoaded: vi.fn(),
      refDataLoader: null,
      listenOnUpdate: vi.fn(),
      ensureLoaded: (cb: any) => cb(context)
    };
    render(
      <ReferenceContext.Provider value={context as any}>
        <LoadReferences onLoad={onLoad} />
      </ReferenceContext.Provider>
    );
    expect(onLoad).toHaveBeenCalled();
  });

  it('registers definition using RefDefinition', async () => {
    const setReference = vi.fn();
    render(
      <ReferenceContext.Provider value={{ setReference }}>
        <RefDefinition authors="Doe" year="2020" title="Study" />
      </ReferenceContext.Provider>
    );
    await waitFor(() => {
      expect(setReference).toHaveBeenCalled();
    });
  });
});
