import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import type {PrimerSeq} from '../../../../../../src/components/ngs2codfreq/options-form/types';
import useValidation from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/use-validation';

describe('primer sequence useValidation', () => {
  it('returns no errors for valid unique primers', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end'},
      {idx: 1, header: 'h2', sequence: 'TGCA', type: 'three-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });

  it('detects duplicate headers', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'dup', sequence: 'ACGT', type: 'five-end'},
      {idx: 1, header: 'dup', sequence: 'TGCA', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects multiple duplicate headers (more than 2)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'dup', sequence: 'ACGT', type: 'five-end'},
      {idx: 1, header: 'dup', sequence: 'TGCA', type: 'five-end'},
      {idx: 2, header: 'dup', sequence: 'GGCC', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    // Should only report duplicate once, but increment counter
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects duplicate sequences', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end'},
      {idx: 1, header: 'h2', sequence: 'ACGT', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects multiple duplicate sequences (more than 2)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end'},
      {idx: 1, header: 'h2', sequence: 'ACGT', type: 'five-end'},
      {idx: 2, header: 'h3', sequence: 'ACGT', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('ignores sequence options after semicolon when checking duplicates', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT;opt1', type: 'five-end'},
      {idx: 1, header: 'h2', sequence: 'ACGT;opt2', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    // Should detect duplicate because bare sequences are the same
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects sequence too short (less than 4 bases)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACG', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects sequence too long (more than 200 bases)', () => {
    const longSeq = 'A'.repeat(201);
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: longSeq, type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects 3-end primer with 5-end anchor (X prefix)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'XACGT', type: 'three-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects 3-end primer with 5-end anchor (^ prefix)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: '^ACGT', type: 'three-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects 5-end primer with 3-end anchor (X suffix)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGTX', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('detects 5-end primer with 3-end anchor ($ suffix)', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT$', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('allows both-end type with any anchors', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: '^ACGT$', type: 'both-end'},
      {idx: 1, header: 'h2', sequence: 'XACGTX', type: 'both-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });

  it('handles empty primers array', () => {
    const primers: PrimerSeq[] = [];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });

  it('updates errors when primers change', () => {
    const primers1: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT', type: 'five-end'}
    ];
    const primers2: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACG', type: 'five-end'}
    ];
    const {result, rerender} = renderHook(
      ({p}) => useValidation(p),
      {initialProps: {p: primers1}}
    );

    expect(result.current.length).toBe(0);

    rerender({p: primers2});

    expect(result.current.length).toBeGreaterThan(0);
  });

  it('handles multiple errors for the same primer', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'dup', sequence: 'AC', type: 'three-end'},
      {idx: 1, header: 'dup', sequence: 'AC', type: 'three-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    // Should have errors for duplicate header, duplicate sequence, and too short
    expect(result.current.length).toBeGreaterThan(2);
  });

  it('correctly validates sequence with semicolon options', () => {
    const primers: PrimerSeq[] = [
      {idx: 0, header: 'h1', sequence: 'ACGT;option1;option2', type: 'five-end'}
    ];
    const {result} = renderHook(() => useValidation(primers));
    expect(result.current.length).toBe(0);
  });
});

