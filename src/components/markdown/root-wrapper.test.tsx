import React from 'react';
import {describe, expect, it} from 'vitest';
import renderRoot, {getHeadingLevel, groupSections} from './root-wrapper';
import {HeadingTag} from '../heading-tags';
import {vi} from 'vitest';

vi.mock('../collapsable', () => ({
  __esModule: true,
  default: {Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>},
  Section: ({children}: any) => <div>{typeof children === 'function' ? children({onLoad: () => {}}) : children}</div>
}));

describe('root-wrapper utilities', () => {
  it('determines heading level', () => {
    expect(getHeadingLevel(<h2 /> as any)).toBe(2);
    expect(getHeadingLevel(<p /> as any)).toBe(-1);
    expect(getHeadingLevel(<HeadingTag level={3}>h3</HeadingTag>)).toBe(3);
  });

  it('groups sections by headings', () => {
    const nodes = [
      <HeadingTag level={1} key="h1">H1</HeadingTag>,
      <p key="p1">para</p>,
      <HeadingTag level={2} key="h2">H2</HeadingTag>,
      <p key="p2">sub</p>
    ];
    const [sections] = groupSections(nodes as any);
    expect(sections.length).toBe(1);
    const result = renderRoot({children: nodes as any});
    expect(React.Children.count((result as any).props.children)).toBe(1);
  });

  it('returns early when heading below min level', () => {
    const nodes = [
      <HeadingTag level={1} key="h1">H1</HeadingTag>
    ];
    const [sections, endIdx] = groupSections(nodes as any, 0, 2);
    expect(sections.length).toBe(0);
    expect(endIdx).toBe(-1);
  });
});
