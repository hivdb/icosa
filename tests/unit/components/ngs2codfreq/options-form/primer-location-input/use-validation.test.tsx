import { renderHook } from '@testing-library/react';
import type { PrimerBed } from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/types';
import useValidation from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/use-validation';

describe('primer location useValidation', () => {
  it('detects invalid start and end positions', () => {
    const primers: PrimerBed[] = [
      { idx: 0, region: 'r', name: 'p1', start: -1, end: 5, score: 60, strand: '+' },
      { idx: 1, region: 'r', name: 'p2', start: 3, end: 2, score: 60, strand: '+' }
    ];
    const { result } = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns no errors for valid primers', () => {
    const primers: PrimerBed[] = [
      { idx: 0, region: 'r', name: 'p1', start: 0, end: 3, score: 60, strand: '+' }
    ];
    const { result } = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    expect(result.current.length).toBe(0);
  });
});

