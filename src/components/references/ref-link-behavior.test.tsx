import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Router + popup shims must be declared before importing SUTs (ESM hoisting)
vi.mock('found', () => ({
  useRouter: () => ({ router: { push: vi.fn(), replace: vi.fn() }, match: { location: { hash: '' } } }),
  withRouter: (Comp: any) => Comp,
  Link: ({ to, children, ...rest }: any) => <a href={to} {...rest}>{children}</a>
}));
vi.mock('reactjs-popup', () => ({ __esModule: true, default: ({ children, trigger }: any) => <span>{trigger}<span>{children}</span></span> }));

import References, { ReferenceContext, useReference, LoadExternalRefData } from './index';
import RefLink from './reference-link';

// End shims

// Minimal ref data loader
function MockRefLoader({ onLoad, setReference, references }: any) {
  React.useEffect(() => {
    for (const ref of references) {
      setReference(ref.name, { ...ref, children: `${ref.name}-CONTENT` }, false);
    }
    onLoad();
  }, [onLoad, setReference, references]);
  return null;
}

function RefProvider({ children }: { children: React.ReactNode }) {
  const ctx = useReference(MockRefLoader, 'test');
  return (
    <ReferenceContext.Provider value={ctx as any}>
      {children}
      <LoadExternalRefData />
    </ReferenceContext.Provider>
  );
}

describe('RefLink behavior (inline and deferred)', () => {
  it('renders inline content when identifier ends with #inline', () => {
    render(
      <RefProvider>
        <RefLink identifier="Foo#inline" />
      </RefProvider>
    );
    expect(screen.getByText('Foo-CONTENT')).toBeTruthy();
    expect(screen.queryByText('[1]')).toBeNull();
  });

  it('increments citations and lists in References', async () => {
    render(
      <RefProvider>
        <div>
          <RefLink identifier="Foo" />
          <RefLink identifier="Foo" />
        </div>
        <References />
      </RefProvider>
    );
    expect(screen.getAllByText('[1]').length).toBe(2);
    expect(await screen.findByText('Foo-CONTENT')).toBeTruthy();
  });
});
