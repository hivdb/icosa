import React from 'react';
import {render, screen} from '@testing-library/react';
import ReferenceContext from '../../../../src/components/references/reference-context';
import {vi} from 'vitest';

vi.mock('../../../../src/components/collapsable', () => ({
  __esModule: true,
  default: {
    Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>
  },
  Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>
}));

import OptReferences, {StaticRefsNode, refsMacro} from '../../../../src/components/markdown/references';

describe('markdown references utilities', () => {
  it('renders static reference list', () => {
    const ctx: any = {
      getReference: () => null,
      setReference: () => null,
      listenOnUpdate: () => () => {}
    };
    const { container } = render(
      <ReferenceContext.Provider value={ctx}>
        <StaticRefsNode names={['foo']} />
      </ReferenceContext.Provider>
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    // Ensure items are under the same list element
    const items = Array.from(list.querySelectorAll('li'));
    expect(items).toHaveLength(1);
  });

  it('registers refs macro', () => {
    const node = refsMacro('a\nb', {foo: 'bar'});
    expect(node).toEqual({type: 'StaticRefsNode', names: ['a', 'b'], foo: 'bar'});
  });

  it('falls back to ul when invalid list tag', () => {
    const ctx: any = {
      getReference: () => null,
      setReference: () => null,
      listenOnUpdate: () => () => {}
    };
    const { container } = render(
      <ReferenceContext.Provider value={ctx}>
        <StaticRefsNode names={['foo']} as={'div' as any} />
      </ReferenceContext.Provider>
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
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
    const { container } = render(
      <ReferenceContext.Provider value={ctx}>
        <OptReferences level={2} referenceTitle="Refs" />
      </ReferenceContext.Provider>
    );
    const heading = screen.getByRole('heading', { name: 'Refs' });
    expect(heading).toBeTruthy();
    // Verify the heading resides above the references list
    const section = heading.closest('section') ?? heading.parentElement!;
    const list = section.querySelector('ol,ul');
    expect(list).not.toBeNull();
  });

  it('handles case without footnote references', () => {
    const ctx: any = {
      hasAnyReference: (footnotes: boolean) => footnotes ? true : false,
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
    expect(screen.queryByText('Refs')).toBeNull();
  });

  it('returns null when context missing', () => {
    const {container} = render(<OptReferences />);
    expect(container.firstChild).toBeNull();
  });
});
