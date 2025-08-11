import {render} from '@testing-library/react';
import {vi} from 'vitest';

vi.mock('found', () => ({
  Link: ({to, children, ...rest}: any) => <a href={to} {...rest}>{children}</a>,
  useRouter: () => ({match: {location: {}}, router: {}}),
  withRouter: (C: any) => C
}));

import ExtendedMarkdown, {areChildrenEqual} from './index';

describe('ExtendedMarkdown', () => {
  it('renders TOC, collapsable sections and references', () => {
    vi.useFakeTimers();
    const md = ['# Title', '\n\nParagraph[^1]\n\n[^1]: footnote'];
    const {container, getByText, unmount} = render(
      <ExtendedMarkdown toc collapsableLevels={[2]} referenceTitle="Refs" referenceHeadingTagLevel={3}>
        {md}
      </ExtendedMarkdown>
    );
    vi.runAllTimers();
    expect(container.querySelector('#_toc')).not.toBeNull();
    expect(container.querySelector('[class*="collapse-h2"]')).not.toBeNull();
    expect(getByText('footnote')).toBeInTheDocument();
    unmount();
    vi.useRealTimers();
  });

  it('renders inline markdown without references or heading anchors', () => {
    const {container} = render(
      <ExtendedMarkdown inline displayReferences={false} noHeadingStyle disableHeadingTagAnchor>
        {`# Heading\nsecond line`}
      </ExtendedMarkdown>
    );
    expect(container.querySelector('#_toc')).toBeNull();
    expect(container.querySelector('h1 a')).toBeNull();
    expect(container.querySelector('p')).toBeNull();
  });

  it('compares children for memoization', () => {
    expect(
      areChildrenEqual({children: 'a'} as any, {children: 'a'} as any)
    ).toBe(true);
    expect(
      areChildrenEqual({children: 'a'} as any, {children: 'b'} as any)
    ).toBe(false);
  });

  it('renders raw HTML when embedded in markdown', () => {
    const {container} = render(
      <ExtendedMarkdown inline displayReferences={false}>
        {'<em id="html-test">raw</em>'}
      </ExtendedMarkdown>
    );
    const em = container.querySelector('#html-test');
    expect(em?.tagName).toBe('EM');
    expect(em?.textContent).toBe('raw');
  });

});
