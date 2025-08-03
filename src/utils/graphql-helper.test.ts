import {describe, expect, it} from 'vitest';
import {parse} from 'graphql';
import {includeFragment, includeFragmentIfExist} from './graphql-helper';

describe('graphql helper', () => {
  const frag = parse(`fragment Foo on Bar { id }`);
  it('includes fragment', () => {
    expect(includeFragment(frag, 'Bar')).toBe('...Foo');
  });
  it('conditionally includes fragment', () => {
    expect(includeFragmentIfExist(frag, 'Baz')).toBe('');
  });
});
