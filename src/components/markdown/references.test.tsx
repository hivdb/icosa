import React from 'react';
import {render, screen} from '@testing-library/react';
import {ReferenceContext} from '../references';
import {vi} from 'vitest';

vi.mock('../collapsable', () => ({
  __esModule: true,
  default: {
    Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>
  },
  Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>
}));

import OptReferences, {StaticRefsNode} from './references';

describe('markdown references utilities', () => {
  it('renders static reference list', () => {
    const ctx: any = {
      getReference: () => null,
      setReference: () => null,
      listenOnUpdate: () => () => {}
    };
    render(
      <ReferenceContext.Provider value={ctx}>
        <StaticRefsNode names={['foo']} />
      </ReferenceContext.Provider>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('conditionally renders references', () => {
    const ctx: any = {
      hasAnyReference: () => true,
      ensureLoaded: (fn: any) => fn({getLinkedReferences: () => []}),
      getAllReferences: () => [],
      setReference: () => {},
      setLoaded: () => {},
      refDataLoader: null,
      listenOnUpdate: () => () => {}
    };
    render(
      <ReferenceContext.Provider value={ctx}>
        <OptReferences level={2} referenceTitle="Refs" />
      </ReferenceContext.Provider>
    );
    expect(screen.getByText('Refs')).toBeTruthy();
  });
});
