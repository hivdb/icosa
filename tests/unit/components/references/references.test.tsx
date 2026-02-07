import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import References, { ReferenceContext, useReference } from '../../../../src/components/references';
import { ReferenceObject } from '../../../../src/components/references/reference-context';
import InlineRef from '../../../../src/components/references/inline-reference';
import LoadReferences from '../../../../src/components/references/load-references';
import RefDefinition from '../../../../src/components/references/reference-definition';

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
    const context = new ReferenceObject({});
    const spy = vi.spyOn(context, 'setReference');
    render(
      <ReferenceContext.Provider value={context}>
        <RefDefinition authors="Doe" year="2020" title="Study" />
      </ReferenceContext.Provider>
    );
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
});
