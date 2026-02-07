import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReferenceContext, { useReference } from '../../../../src/components/references/reference-context';

describe('ReferenceContext and useReference', () => {
  it('stores and retrieves references and notifies listeners', () => {
    const { result } = renderHook(() => useReference());
    const refObj = result.current!;
    const onUpdate = vi.fn();
    refObj.listenOnUpdate(onUpdate);

    const { number, itemId, linkId } = refObj.setReference('Foo', { title: 'Test' }, true);
    expect(number).toBe(1);
    expect(itemId).toBe('1_foo');
    expect(linkId).toBe('1_foo_1');
    expect(refObj.getReference('Foo').title).toBe('Test');
    expect(onUpdate).toHaveBeenCalled();

    expect(refObj.hasAnyReference()).toBe(true);
    expect(refObj.hasAnyReference(true)).toBe(true);

    const all = refObj.getAllReferences();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ number: 1, itemId: '1_foo', linkIds: ['1_foo_1'] });

    const linked = refObj.getLinkedReferences();
    expect(linked).toHaveLength(1);

    refObj.setReference('Bar', { title: 'Bar' }, false);
    expect(refObj.getLinkedReferences()).toHaveLength(1);
    expect(refObj.hasAnyReference()).toBe(true);
  });

  it('defers rendering until loaded when loader provided', async () => {
    const { result } = renderHook(() => useReference(() => null));
    const refObj = result.current!;

    function Test() {
      return <div>{refObj.ensureLoaded(() => <span>loaded</span>, <span>loading</span>)}</div>;
    }

    const { getByText, queryByText } = render(<Test />);
    expect(getByText('loading')).toBeTruthy();
    act(() => {
      refObj.setLoaded();
    });
    await waitFor(() => expect(getByText('loaded')).toBeTruthy());
    expect(queryByText('loading')).toBeNull();
  });

  it('memoizes ReferenceObject unless cacheKey changes', () => {
    const { result, rerender } = renderHook(({ key }) => useReference(undefined, key), {
      initialProps: { key: 1 }
    });
    const first = result.current;
    rerender({ key: 1 });
    expect(result.current).toBe(first);
    rerender({ key: 2 });
    expect(result.current).not.toBe(first);
  });
});
