import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';

import DebugRefDataLoader from './debug-ref-data-loader';

describe('DebugRefDataLoader', () => {
  it('calls setReference for each reference', () => {
    vi.useFakeTimers();
    const setReference = vi.fn();
    const onLoad = vi.fn();
    const refs = [{name: 'r1'}, {name: 'r2'}];
    render(<DebugRefDataLoader references={refs} setReference={setReference} onLoad={onLoad} />);
    vi.runAllTimers();
    expect(setReference).toHaveBeenCalledTimes(2);
    expect(onLoad).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
