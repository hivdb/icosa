import {describe, test, expect} from 'vitest';
import {renderHook} from '@testing-library/react';

import useBasePath, {getBasePath} from '../../../../src/components/analyze-forms/use-base-path';

describe('getBasePath', () => {
  test('removes last segment from pathname', () => {
    expect(getBasePath('/analyze/by-sequences/')).toBe('/analyze');
  });

  test('handles pathname without trailing slash', () => {
    expect(getBasePath('/analyze/by-patterns')).toBe('/analyze');
  });

  test('handles root path', () => {
    expect(getBasePath('/by-reads/')).toBe('');
  });

  test('handles single segment', () => {
    expect(getBasePath('/analyze')).toBe('');
  });

  test('handles multiple segments', () => {
    expect(getBasePath('/foo/bar/baz/qux/')).toBe('/foo/bar/baz');
  });
});

describe('useBasePath', () => {
  test('returns memoized base path', () => {
    const {result, rerender} = renderHook(
      ({pathname}) => useBasePath({pathname}),
      {initialProps: {pathname: '/analyze/by-sequences/'}}
    );

    expect(result.current).toBe('/analyze');

    // Rerender with same pathname - should return same reference
    rerender({pathname: '/analyze/by-sequences/'});
    expect(result.current).toBe('/analyze');

    // Rerender with different pathname
    rerender({pathname: '/analyze/by-patterns/'});
    expect(result.current).toBe('/analyze');
  });

  test('updates when pathname changes', () => {
    const {result, rerender} = renderHook(
      ({pathname}) => useBasePath({pathname}),
      {initialProps: {pathname: '/foo/bar/'}}
    );

    expect(result.current).toBe('/foo');

    rerender({pathname: '/baz/qux/'});
    expect(result.current).toBe('/baz');
  });
});
