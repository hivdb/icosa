import {describe, expect, it} from 'vitest';
import {parseMutation, expandIndel, mutationCompare, parseAndValidateMutation, sanitizeMutations} from './mutation';

describe('mutation utils', () => {
  it('parses mutation string', () => {
    expect(parseMutation('PR:L10F')).toEqual(['10', 'F', 'L', 'PR']);
  });

  it('expands indels', () => {
    expect(expandIndel('i')).toBe('ins');
    expect(expandIndel('d')).toBe('del');
  });

  it('compares mutations', () => {
    expect(mutationCompare('A1B', 'A2B')).toBeLessThan(0);
  });

  it('validates mutation', () => {
    const res = parseAndValidateMutation('PR:L10F', {
      geneSynonyms: {PR: 'PR'},
      geneReferences: {PR: 'L'.repeat(200)},
      messages: {}
    });
    expect(res.errors).toHaveLength(0);
  });

  it('sanitizes list', () => {
    const [sanitized] = sanitizeMutations(['PR:L10F'], {
      geneSynonyms: {PR: 'PR'},
      geneReferences: {PR: 'LL'},
      messages: {},
      defaultGene: 'PR'
    });
    expect(sanitized).toEqual(['PR:L10F']);
  });
});
