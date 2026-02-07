import { renderHook } from '@testing-library/react';
import type { PrimerSeq } from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/types';
import useValidation from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/use-validation';

describe('primer sequence useValidation', () => {
  it('detects duplicate sequences and headers', () => {
    const primers: PrimerSeq[] = [
      { idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end' },
      { idx: 1, header: 'h1', sequence: 'ACGT', type: 'five-end' }
    ];
    const { result } = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns no errors for valid unique primers', () => {
    const primers: PrimerSeq[] = [
      { idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end' },
      { idx: 1, header: 'h2', sequence: 'TGCA', type: 'three-end' }
    ];
    const { result } = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });
});

