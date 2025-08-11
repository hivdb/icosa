import {render} from '@testing-library/react';
import ExtendedMarkdown from './index';

describe('ExtendedMarkdown', () => {
  it('renders TOC, collapsable sections and references', () => {
    const md = ['# Title', '\n\nParagraph[^1]\n\n[^1]: footnote'];
    const {container} = render(
      <ExtendedMarkdown toc collapsableLevels={[2]} referenceTitle="Refs" referenceHeadingTagLevel={3}>
        {md}
      </ExtendedMarkdown>
    );
    expect(container.querySelector('#_toc')).not.toBeNull();
    expect(container.querySelector('[class*="collapse-h2"]')).not.toBeNull();
    // invoke memo comparator for coverage
    expect((ExtendedMarkdown as any).compare({children: 'a'}, {children: 'a'})).toBe(true);
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
});
