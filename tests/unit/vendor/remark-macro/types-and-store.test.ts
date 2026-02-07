import { describe, it, expect } from 'vitest';
import { parseProps } from '../../../../src/vendor/remark-macro/types';
import store, { attachRawProps } from '../../../../src/vendor/remark-macro/raw-store';

describe('remark-macro utils', () => {
  it('parseProps parses quoted and unquoted values', () => {
    const props = parseProps('key="value", a=1, b = "two words"');
    expect(props).toEqual({ key: 'value', a: '1', b: 'two words' });
  });

  it('raw-store roundtrips objects without serialization', () => {
    const obj = { a: [1, 2], b: { c: 'x' } };
    const id = store.putRawProps(obj);
    expect(typeof id).toBe('string');
    const out = store.getRawProps(id);
    expect(out).toEqual(obj);
    store.clearRawProps(id);
    expect(store.getRawProps(id)).toBeUndefined();
  });

  it('attachRawProps associates with a target and returns an id', () => {
    const obj = { x: 1 };
    const target = {};
    const id = attachRawProps(target, obj);
    expect(typeof id).toBe('string');
    expect(store.getRawProps(id)).toEqual(obj);
    store.clearRawProps(id);
  });

  it('clearAll removes every stored entry', () => {
    const ids: string[] = [];
    ids.push(store.putRawProps({ a: 1 }));
    ids.push(store.putRawProps({ b: 2 }));
    expect(store.getRawProps(ids[0])).toBeTruthy();
    expect(store.getRawProps(ids[1])).toBeTruthy();
    store.clearAll();
    expect(store.getRawProps(ids[0])).toBeUndefined();
    expect(store.getRawProps(ids[1])).toBeUndefined();
  });
});
