import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import useMounted, {useMountedCallback} from '../../../src/utils/use-mounted';

describe('useMounted hook', () => {
  it('tracks mounted status', () => {
    let getMounted: () => boolean = () => false;
    function Test() {
      getMounted = useMounted();
      return null;
    }
    const {unmount} = render(<Test />);
    expect(getMounted()).toBe(true);
    unmount();
    expect(getMounted()).toBe(false);
  });

  it('runs callback only when mounted', () => {
    let triggered = false;
    let call: () => void = () => {};
    function Test() {
      call = useMountedCallback(() => {
        triggered = true;
      }, []);
      return null;
    }
    const {unmount} = render(<Test />);
    call();
    expect(triggered).toBe(true);
    triggered = false;
    unmount();
    call();
    expect(triggered).toBe(false);
  });
});
