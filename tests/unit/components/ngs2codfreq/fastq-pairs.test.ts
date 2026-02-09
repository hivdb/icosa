import {describe, test, expect} from 'vitest';
import {identifyPairs, moveFile, removeFile, splicePair} from '../../../../src/components/ngs2codfreq/fastq-pairs';
import type {FastqPair} from '../../../../src/components/ngs2codfreq/types';

describe('fastq-pairs utilities', () => {
  describe('identifyPairs', () => {
    test('groups paired files with underscore delimiter', () => {
      const files = [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(2);
      expect(pairs[0].name).toBe('sample');
      expect(pairs[0].pattern.delimiter).toBe('_');
    });

    test('groups paired files with hyphen delimiter', () => {
      const files = [new File([], 'sample-1.fastq'), new File([], 'sample-2.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(2);
      expect(pairs[0].pattern.delimiter).toBe('-');
    });

    test('groups paired files with space delimiter', () => {
      const files = [new File([], 'sample 1.fastq'), new File([], 'sample 2.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(2);
      expect(pairs[0].pattern.delimiter).toBe(' ');
    });

    test('handles gzipped fastq files', () => {
      const files = [new File([], 'sample_1.fastq.gz'), new File([], 'sample_2.fastq.gz')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(2);
    });

    test('handles complex paired pattern', () => {
      const files = [
        new File([], '14258F_L001_R1_001.fastq.gz'),
        new File([], '14258F_L001_R2_001.fastq.gz')
      ];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(2);
      expect(pairs[0].name).toBe('14258F_L001_001');
    });

    test('treats unpaired files as singles', () => {
      const files = [new File([], 'single.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].n).toBe(1);
      expect(pairs[0].pair[1]).toBeNull();
    });

    test('handles mixed paired and unpaired files', () => {
      const files = [
        new File([], 'sample_1.fastq'),
        new File([], 'sample_2.fastq'),
        new File([], 'single.fastq')
      ];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(2);
      expect(pairs.find(p => p.n === 2)).toBeDefined();
      expect(pairs.find(p => p.n === 1)).toBeDefined();
    });

    test('rejects files with different lengths', () => {
      const files = [new File([], 'sample_1.fastq'), new File([], 'sample_22.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(2);
      expect(pairs.every(p => p.n === 1)).toBe(true);
    });

    test('rejects invalid paired markers like 10, 11, 12', () => {
      const files = [new File([], 'sample_11.fastq'), new File([], 'sample_12.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(2);
      expect(pairs.every(p => p.n === 1)).toBe(true);
    });

    test('rejects files without delimiters in names', () => {
      const files = [new File([], 'sample1.fastq'), new File([], 'sample2.fastq')];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs).toHaveLength(2);
      expect(pairs.every(p => p.n === 1)).toBe(true);
    });

    test('handles empty file list', () => {
      const pairs = Array.from(identifyPairs([]));
      expect(pairs).toHaveLength(0);
    });

    test('orders pairs by file name', () => {
      const files = [
        new File([], 'sample_2.fastq'),
        new File([], 'sample_1.fastq')
      ];
      const pairs = Array.from(identifyPairs(files));
      expect(pairs[0].pair[0]?.name).toBe('sample_1.fastq');
      expect(pairs[0].pair[1]?.name).toBe('sample_2.fastq');
    });
  });

  describe('moveFile', () => {
    test('moves file between pairs', () => {
      const pair1: FastqPair = {
        name: 'a',
        pair: [new File([], 'sample_1.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const pair2: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_2.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const moved = moveFile([pair1, pair2], {index: 0, fileName: 'sample_1.fastq'}, {index: 1});
      expect(moved).toHaveLength(1);
      expect(moved[0].n).toBe(2);
    });

    test('throws error when target is already paired', () => {
      const pair1: FastqPair = {
        name: 'a',
        pair: [new File([], 'a.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const pair2: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      expect(() => {
        moveFile([pair1, pair2], {index: 0, fileName: 'a.fastq'}, {index: 1});
      }).toThrow('Target group is already paired.');
    });

    test('updates pattern when creating new pair', () => {
      const pair1: FastqPair = {
        name: 'a',
        pair: [new File([], 'sample_1.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const pair2: FastqPair = {
        name: 'b',
        pair: [new File([], 'sample_2.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const moved = moveFile([pair1, pair2], {index: 0, fileName: 'sample_1.fastq'}, {index: 1});
      expect(moved).toHaveLength(1);
      expect(moved[0].pattern.delimiter).toBe('_');
      expect(moved[0].name).toBe('sample');
    });
  });

  describe('removeFile', () => {
    test('removes single file from single pair', () => {
      const pair: FastqPair = {
        name: 'a',
        pair: [new File([], 'a.fastq'), null],
        pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
        n: 1
      };
      const updated = removeFile([pair], 0, 'a.fastq');
      expect(updated).toHaveLength(0);
    });

    test('removes one file from paired entry', () => {
      const pair: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      const updated = removeFile([pair], 0, 'sample_1.fastq');
      expect(updated).toHaveLength(1);
      expect(updated[0].n).toBe(1);
      expect(updated[0].pair[0]?.name).toBe('sample_2.fastq');
      expect(updated[0].pair[1]).toBeNull();
    });

    test('resets pattern when removing from pair', () => {
      const pair: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      const updated = removeFile([pair], 0, 'sample_1.fastq');
      expect(updated[0].pattern.delimiter).toBeNull();
      expect(updated[0].pattern.reverse).toBe(-1);
    });
  });

  describe('splicePair', () => {
    test('splits paired entry into two singles', () => {
      const pair: FastqPair = {
        name: 'a',
        pair: [new File([], 'a_1.fastq'), new File([], 'a_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      const result = splicePair([pair], 0);
      expect(result).toHaveLength(2);
      expect(result[0].n).toBe(1);
      expect(result[1].n).toBe(1);
    });

    test('creates singles with null second element', () => {
      const pair: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      const result = splicePair([pair], 0);
      expect(result[0].pair[1]).toBeNull();
      expect(result[1].pair[1]).toBeNull();
    });

    test('resets patterns for split singles', () => {
      const pair: FastqPair = {
        name: 'sample',
        pair: [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')],
        pattern: {delimiter: '_', diffOffset: 1, posPairedMarker: 0, reverse: -1},
        n: 2
      };
      const result = splicePair([pair], 0);
      expect(result[0].pattern.delimiter).toBeNull();
      expect(result[0].pattern.reverse).toBe(-1);
      expect(result[1].pattern.delimiter).toBeNull();
      expect(result[1].pattern.reverse).toBe(-1);
    });
  });
});
