import {describe, expect, it} from 'vitest';

import {
  compareCodon,
  convertToAmbiguousNa,
  getCodons,
  mergeCodons,
  translateCodon,
  translateCodons
} from './codonutils';

describe('codonutils', () => {
  it('converts nucleotides to ambiguous code', () => {
    expect(convertToAmbiguousNa('AG')).toBe('R');
  });

  it('merges codons with ambiguity', () => {
    expect(mergeCodons(['ATG', 'ATA'])).toBe('ATR');
  });

  it('translates codons', () => {
    expect(translateCodon('ATG')).toBe('M');
    expect(translateCodons('ATGATG')).toBe('MM');
  });

  it('retrieves codons for amino acid', () => {
    expect(getCodons('M')).toContain('ATG');
  });

  it('compares codons with ambiguity', () => {
    expect(compareCodon('ATG', 'ATG')).toBe(true);
    expect(compareCodon('ATG', 'ATR')).toBe(true);
    expect(compareCodon('ATG', 'TTT')).toBe(false);
  });
});

