import {describe, it, expect} from 'vitest';
import {getAnchor, HeadingTag} from '../../../../src/components/heading-tags';

describe('HeadingTag utilities', () => {
  it('derives anchor from HeadingTag children', () => {
    const anchor = getAnchor(<HeadingTag level={2}>Hello World</HeadingTag>);
    expect(anchor).toBe('hello.world');
  });

  it('derives anchor from generic nodes', () => {
    const anchor = getAnchor(<span>Generic Text</span>);
    expect(anchor).toBe('generic.text');
  });
});
