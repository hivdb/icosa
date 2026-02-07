import {describe, it, expect, vi} from 'vitest';

vi.mock('web-vitals', () => ({
  getCLS: (cb: any) => cb({}),
  getFID: (cb: any) => cb({}),
  getFCP: (cb: any) => cb({}),
  getLCP: (cb: any) => cb({}),
  getTTFB: (cb: any) => cb({}),
}));

import reportWebVitals from '../../src/reportWebVitals';

describe('reportWebVitals', () => {
  it('is callable', () => {
    const handler = vi.fn();
    reportWebVitals(handler);
    expect(typeof reportWebVitals).toBe('function');
  });
});
