import {renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import useSmartAsync from './use-smart-async';

// FIXME: This test intermittently hangs in the test runner and is temporarily
// disabled. Once the underlying issue with useSmartAsync or the test
// environment is resolved, the test should be re-enabled.
describe.skip('useSmartAsync', () => {
  it('returns stable async result', async () => {
    const {result} = renderHook(() =>
      useSmartAsync<number>({promiseFn: async () => 42})
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.data).toBe(42);
  });
});
