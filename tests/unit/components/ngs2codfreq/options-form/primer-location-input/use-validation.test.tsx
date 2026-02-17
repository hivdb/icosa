import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import type {PrimerBed} from '../../../../../../src/components/ngs2codfreq/options-form/types';
import useValidation from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/use-validation';

describe('primer location useValidation', () => {
  it('returns no errors for valid primers', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: 0, end: 3, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    expect(result.current.length).toBe(0);
  });

  it('detects start position less than 0', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: -1, end: 5, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects end position greater than reference length', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: 0, end: 100, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects end position before or equal to start position', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p2', start: 5, end: 3, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects duplicate primer names', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'dup', start: 0, end: 3, score: 60, strand: '+'},
      {idx: 1, region: 'r', name: 'dup', start: 4, end: 7, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGT')
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects multiple duplicate primer names (more than 2)', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'dup', start: 0, end: 3, score: 60, strand: '+'},
      {idx: 1, region: 'r', name: 'dup', start: 4, end: 7, score: 60, strand: '+'},
      {idx: 2, region: 'r', name: 'dup', start: 8, end: 11, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGTACGTACGT')
    );
    // Should only report duplicate once, but increment counter
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns empty array when refSequence is null', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: -1, end: 5, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, null)
    );
    expect(result.current.length).toBe(0);
  });

  it('updates errors when primers change', () => {
    const primers1: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: 0, end: 3, score: 60, strand: '+'}
    ];
    const primers2: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: -1, end: 3, score: 60, strand: '+'}
    ];
    const {result, rerender} = renderHook(
      ({p}) => useValidation(p, 'ACGTACGT'),
      {initialProps: {p: primers1}}
    );

    expect(result.current.length).toBe(0);

    rerender({p: primers2});

    expect(result.current.length).toBeGreaterThan(0);
  });

  it('updates errors when refSequence changes', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'p1', start: 0, end: 10, score: 60, strand: '+'}
    ];
    const {result, rerender} = renderHook(
      ({ref}) => useValidation(primers, ref),
      {initialProps: {ref: 'ACGTACGTACGTACGT'}}
    );

    expect(result.current.length).toBe(0);

    rerender({ref: 'ACGT'});

    expect(result.current.length).toBeGreaterThan(0);
  });

  it('handles multiple errors for the same primer', () => {
    const primers: PrimerBed[] = [
      {idx: 0, region: 'r', name: 'bad', start: -1, end: 100, score: 60, strand: '+'}
    ];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    // Should have errors for start < 0, end > length, and end <= start
    expect(result.current.length).toBeGreaterThan(1);
  });

  it('handles empty primers array', () => {
    const primers: PrimerBed[] = [];
    const {result} = renderHook(() =>
      useValidation(primers, 'ACGTACGT')
    );
    expect(result.current.length).toBe(0);
  });
});

