import { describe, it, expect, vi } from 'vitest';
import { focusElement } from './funcs';

describe('focusElement', () => {
  it('scrolls element into view and toggles focus attribute', () => {
    vi.useFakeTimers();
    const elem = document.createElement('div');
    elem.scrollIntoView = vi.fn();

    focusElement(elem);
    expect(elem.scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    expect(elem.dataset.anchorFocused).toBe('true');

    vi.runAllTimers();
    expect(elem.dataset.anchorFocused).toBeUndefined();
    vi.useRealTimers();
  });
});
