import {renderHook} from '@testing-library/react';
import {useBasePath} from './index';

describe('useBasePath', () => {
  /**
   * Ensure base path is derived by removing the trailing segment.
   */
  it('computes base path from location', () => {
    const {result} = renderHook(() =>
      useBasePath({pathname: '/foo/bar/'} as any)
    );
    expect(result.current).toBe('/foo');
  });
});
