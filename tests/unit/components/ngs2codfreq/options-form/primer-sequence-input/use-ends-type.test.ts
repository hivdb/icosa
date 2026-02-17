import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';

import useEndsType from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/use-ends-type';

describe('useEndsType', () => {
  describe('threeEndType detection', () => {
    it('detects regular 3-end type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      expect(result.current.threeEndType).toBe('regular');
    });

    it('detects non-internal 3-end type with X suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCGX', setSequence));

      expect(result.current.threeEndType).toBe('non-internal');
    });

    it('detects anchored 3-end type with $ suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG$', setSequence));

      expect(result.current.threeEndType).toBe('anchored');
    });

    it('handles sequence with semicolon separator', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCGX;option', setSequence));

      expect(result.current.threeEndType).toBe('non-internal');
    });

    it('returns regular for single character sequence', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('A', setSequence));

      expect(result.current.threeEndType).toBe('regular');
    });

    it('returns regular for empty sequence', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('', setSequence));

      expect(result.current.threeEndType).toBe('regular');
    });
  });

  describe('fiveEndType detection', () => {
    it('detects regular 5-end type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      expect(result.current.fiveEndType).toBe('regular');
    });

    it('detects non-internal 5-end type with X prefix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('XATCG', setSequence));

      expect(result.current.fiveEndType).toBe('non-internal');
    });

    it('detects anchored 5-end type with ^ prefix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('^ATCG', setSequence));

      expect(result.current.fiveEndType).toBe('anchored');
    });

    it('returns regular for single character sequence', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('A', setSequence));

      expect(result.current.fiveEndType).toBe('regular');
    });

    it('returns regular for empty sequence', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('', setSequence));

      expect(result.current.fiveEndType).toBe('regular');
    });
  });

  describe('setThreeEndType', () => {
    it('sets 3-end type to regular by removing suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCGX', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'regular'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCG');
    });

    it('sets 3-end type to anchored by adding $ suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'anchored'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCG$');
    });

    it('sets 3-end type to non-internal by adding X suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'non-internal'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCGX');
    });

    it('replaces existing suffix when changing type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG$', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'non-internal'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCGX');
    });

    it('preserves semicolon options when changing type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG;opt1;opt2', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'anchored'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCG$;opt1;opt2');
    });

    it('removes suffix and preserves options when setting to regular', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCGX;opt1', setSequence));

      act(() => {
        result.current.setThreeEndType({currentTarget: {value: 'regular'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCG;opt1');
    });
  });

  describe('setFiveEndType', () => {
    it('sets 5-end type to regular by removing prefix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('XATCG', setSequence));

      act(() => {
        result.current.setFiveEndType({currentTarget: {value: 'regular'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('ATCG');
    });

    it('sets 5-end type to anchored by adding ^ prefix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      act(() => {
        result.current.setFiveEndType({currentTarget: {value: 'anchored'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('^ATCG');
    });

    it('sets 5-end type to non-internal by adding X prefix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCG', setSequence));

      act(() => {
        result.current.setFiveEndType({currentTarget: {value: 'non-internal'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('XATCG');
    });

    it('replaces existing prefix when changing type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('^ATCG', setSequence));

      act(() => {
        result.current.setFiveEndType({currentTarget: {value: 'non-internal'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('XATCG');
    });

    it('preserves 3-end markers and options when changing 5-end type', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('ATCGX;opt1', setSequence));

      act(() => {
        result.current.setFiveEndType({currentTarget: {value: 'anchored'}} as any);
      });

      expect(setSequence).toHaveBeenCalledWith('^ATCGX;opt1');
    });
  });

  describe('combined 5-end and 3-end types', () => {
    it('handles both prefix and suffix markers', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('^ATCG$', setSequence));

      expect(result.current.fiveEndType).toBe('anchored');
      expect(result.current.threeEndType).toBe('anchored');
    });

    it('handles X prefix and X suffix', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('XATCGX', setSequence));

      expect(result.current.fiveEndType).toBe('non-internal');
      expect(result.current.threeEndType).toBe('non-internal');
    });

    it('handles mixed prefix and suffix types', () => {
      const setSequence = vi.fn();
      const {result} = renderHook(() => useEndsType('^ATCGX', setSequence));

      expect(result.current.fiveEndType).toBe('anchored');
      expect(result.current.threeEndType).toBe('non-internal');
    });
  });

  describe('memoization', () => {
    it('maintains stable function references', () => {
      const setSequence = vi.fn();
      const {result, rerender} = renderHook(
        ({seq}) => useEndsType(seq, setSequence),
        {initialProps: {seq: 'ATCG'}}
      );

      const initialSetThreeEndType = result.current.setThreeEndType;
      const initialSetFiveEndType = result.current.setFiveEndType;

      rerender({seq: 'ATCG'});

      expect(result.current.setThreeEndType).toBe(initialSetThreeEndType);
      expect(result.current.setFiveEndType).toBe(initialSetFiveEndType);
    });

    it('updates types when sequence changes', () => {
      const setSequence = vi.fn();
      const {result, rerender} = renderHook(
        ({seq}) => useEndsType(seq, setSequence),
        {initialProps: {seq: 'ATCG'}}
      );

      expect(result.current.threeEndType).toBe('regular');

      rerender({seq: 'ATCG$'});

      expect(result.current.threeEndType).toBe('anchored');
    });
  });
});
