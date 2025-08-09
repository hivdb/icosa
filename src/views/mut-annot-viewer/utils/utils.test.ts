import '@testing-library/jest-dom';
import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import getAnnotation from './get-annotation';
import sentenceCase from './sentence-case';
import {citationIdCompare} from './citation-id-compare';
import {usePositionLookup} from './use-position-lookup';

describe('mut-annot-viewer utils', () => {
  it('getAnnotation returns matching annotation', () => {
    const annots = [
      {name: 'foo', value: 'bar', description: 'desc'},
      {name: 'baz', value: 'qux'}
    ];
    expect(getAnnotation(annots, 'foo')).toEqual({annotVal: 'bar', annotDesc: 'desc'});
    expect(getAnnotation(annots, 'missing')).toEqual({annotVal: null, annotDesc: null});
  });

  it('sentenceCase capitalizes first letter', () => {
    expect(sentenceCase('hello')).toBe('Hello');
  });

  it('citationIdCompare compares segments numerically', () => {
    expect(citationIdCompare('2.10', '2.9')).toBeGreaterThan(0);
    expect(citationIdCompare('1.2', '2.1')).toBeLessThan(0);
    expect(citationIdCompare('3.4', '3.4')).toBe(0);
  });

  it('usePositionLookup builds lookup table', () => {
    const positions = [
      {position: 1, foo: 'a'},
      {position: 2, foo: 'b'}
    ];
    const {result} = renderHook(() => usePositionLookup(positions));
    expect(result.current[1].foo).toBe('a');
    expect(result.current[2].foo).toBe('b');
  });
});
