import { renderHook } from '@testing-library/react';
import type { PrimerSeq } from '../types';
import useValidation from './use-validation';

describe('primer sequence useValidation', () => {
  it('detects duplicate sequences and headers', () => {
    const primers: PrimerSeq[] = [
      { header: 'h1', sequence: 'ACGT', type: 'five-end' },
      { header: 'h1', sequence: 'ACGT', type: 'five-end' }
    ];
    const { result } = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns no errors for valid unique primers', () => {
    const primers: PrimerSeq[] = [
      { header: 'h1', sequence: 'ACGT', type: 'five-end' },
      { header: 'h2', sequence: 'TGCA', type: 'three-end' }
    ];
    const { result } = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });
});

