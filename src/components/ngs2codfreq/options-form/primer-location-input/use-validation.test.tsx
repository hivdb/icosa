import { renderHook } from '@testing-library/react';
import type { PrimerBed } from '../types';
import useValidation from './use-validation';

describe('primer location useValidation', () => {
  it('detects invalid start and end positions', () => {
    const primers: PrimerBed[] = [
      { name: 'p1', start: -1, end: 5 },
      { name: 'p2', start: 3, end: 2 }
    ];
    const { result } = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns no errors for valid primers', () => {
    const primers: PrimerBed[] = [{ name: 'p1', start: 0, end: 3 }];
    const { result } = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    expect(result.current.length).toBe(0);
  });
});

