import {renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import useSmartAsync from './use-smart-async';

describe('useSmartAsync', () => {
  it('returns stable async result', async () => {
    const {result} = renderHook(() =>
      useSmartAsync<number>({promiseFn: async () => 42})
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.data).toBe(42);
  });
});
