import React from 'react';
import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig
} from '../../../../src/components/ngs2codfreq/options-form/types';

vi.mock('../../../../src/utils/use-persisted-state', () => ({
  default: () => {
    return () => {
      const [state, setState] = React.useState({});
      return [state, setState];
    };
  }
}));

import useOptions from '../../../../src/components/ngs2codfreq/use-options';

describe('useOptions', () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};
    
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockLocalStorage[key] || null;
    });
    
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default State', () => {
    it('returns default options on initial render', () => {
      const {result} = renderHook(() => useOptions());
      const [options, , isDefault] = result.current;

      expect(options.primerType).toBe('off');
      expect(options.saveInBrowser).toBe(true);
      expect(options.fastpConfig).toEqual(defaultFastpConfig);
      expect(options.cutadaptConfig).toEqual(defaultCutadaptConfig);
      expect(options.ivarConfig).toEqual(defaultIvarConfig);
      expect(isDefault).toBe(true);
    });

    it('detects when options are at default values', () => {
      const {result} = renderHook(() => useOptions());
      const [, , isDefault] = result.current;

      expect(isDefault).toBe(true);
    });
  });

  describe('Change Handler', () => {
    it('updates a simple property', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('primerType', 'fasta');
      });

      const [options] = result.current;
      expect(options.primerType).toBe('fasta');
    });

    it('updates a nested property using lodash set syntax', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('fastpConfig.lengthRequired', 100);
      });

      const [options] = result.current;
      expect(options.fastpConfig?.lengthRequired).toBe(100);
    });

    it('updates entire object when key is "."', () => {
      const {result} = renderHook(() => useOptions());

      const newOptions = {
        primerType: 'bed' as const,
        saveInBrowser: false,
        fastpConfig: {...defaultFastpConfig, lengthRequired: 200},
        cutadaptConfig: {...defaultCutadaptConfig},
        ivarConfig: {...defaultIvarConfig}
      };

      act(() => {
        const [, onChange] = result.current;
        onChange('.', newOptions);
      });

      const [options] = result.current;
      expect(options.primerType).toBe('bed');
      expect(options.fastpConfig?.lengthRequired).toBe(200);
    });

    it('detects when options are no longer default after change', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('primerType', 'fasta');
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(false);
    });
  });

  describe('SaveInBrowser Flag', () => {
    it('includes saveInBrowser flag in options', () => {
      const {result} = renderHook(() => useOptions());
      const [options] = result.current;

      expect(options.saveInBrowser).toBe(true);
    });

    it('allows changing saveInBrowser flag', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('saveInBrowser', false);
      });

      const [options] = result.current;
      expect(options.saveInBrowser).toBe(false);
    });
  });

  describe('isDefault Detection', () => {
    it('returns false when fastpConfig is modified', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('fastpConfig.lengthRequired', 999);
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(false);
    });

    it('returns false when cutadaptConfig is modified', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('cutadaptConfig.errorRate', 0.5);
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(false);
    });

    it('returns false when ivarConfig is modified', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('ivarConfig.minDepth', 999);
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(false);
    });

    it('returns false when primerType is changed from off', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('primerType', 'fasta');
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(false);
    });

    it('returns true when all configs match defaults and primerType is off', () => {
      const {result} = renderHook(() => useOptions());

      act(() => {
        const [, onChange] = result.current;
        onChange('primerType', 'fasta');
      });

      act(() => {
        const [, onChange] = result.current;
        onChange('primerType', 'off');
      });

      const [, , isDefault] = result.current;
      expect(isDefault).toBe(true);
    });
  });
});
