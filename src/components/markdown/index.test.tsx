import {render, waitFor, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi} from 'vitest';

vi.mock('found', () => ({
  Link: ({to, children, ...rest}: any) => <a href={to} {...rest}>{children}</a>,
  useRouter: () => ({match: {location: {}}, router: {}}),
  withRouter: (C: any) => C
}));

import ExtendedMarkdown, {areChildrenEqual, normalizeChildren} from './index';
import type {Preset} from '../genome-map/types';

describe('ExtendedMarkdown', () => {
  it('joins array children into a single markdown string', () => {
    expect(normalizeChildren(['# A', 'B'])).toBe('# AB');
  });

  it('renders TOC and collapsable sections', async () => {
    const md = '# Title\n\n## Section';
    const {container, unmount} = render(
      <ExtendedMarkdown toc collapsableLevels={[2]}>
        {md}
      </ExtendedMarkdown>
    );
    await waitFor(() => expect(container.querySelector('#_toc')).not.toBeNull());
    expect(container.querySelector('[class*="collapse-h2"]')).not.toBeNull();
    unmount();
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
      <ExtendedMarkdown inline displayReferences={false} escapeHtml={false}>
        {'<em id="html-test">raw</em>'}
      </ExtendedMarkdown>
    );
    const em = container.querySelector('#html-test');
    expect(em?.tagName).toBe('EM');
    expect(em?.textContent).toBe('raw');
  });

  it('parses table macro and renders table data', () => {
    const tables = {
      sample: {
        columnDefs: [{name: 'c1'}],
        data: [{c1: 'unique-table-data'}],
        references: ''
      }
    };
    render(
      <ExtendedMarkdown tables={tables} displayReferences={false} inline>
        {'[table]\nsample\n[/table]'}
      </ExtendedMarkdown>
    );
    expect(screen.getByText('unique-table-data')).toBeInTheDocument();
  });

  it('parses genomemap macro and renders genome map', () => {
    const preset: Preset = {
      name: 'foo',
      label: 'Foo',
      width: 200,
      height: 100,
      paddingTop: 0,
      paddingLeft: 0,
      paddingRight: 0,
      domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
      positionGroups: [{name: 'g', positions: []}],
      regions: [],
      hidePositionAxis: true
    };
    const {container} = render(
      <ExtendedMarkdown genomeMaps={{foo: preset}} displayReferences={false} inline>
        {'[genomemap]\nfoo\n[/genomemap]'}
      </ExtendedMarkdown>
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('parses toc macro and renders table of contents', () => {
    const {container} = render(
      <ExtendedMarkdown displayReferences={false} inline>
        {'[toc]\n## Section\n[/toc]'}
      </ExtendedMarkdown>
    );
    const toc = container.querySelector('#_toc');
    expect(toc).not.toBeNull();
    expect(toc?.textContent).toContain('Section');
  });

});
