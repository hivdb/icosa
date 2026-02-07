import {identifyPairs, moveFile, removeFile, splicePair, type FastqPair} from '../../../../src/components/ngs2codfreq/fastq-pairs';

describe('fastq-pairs utilities', () => {
  test('identifyPairs groups paired files', () => {
    const files = [new File([], 'sample_1.fastq'), new File([], 'sample_2.fastq')];
    const pairs = Array.from(identifyPairs(files));
    expect(pairs).toHaveLength(1);
    expect(pairs[0].n).toBe(2);
  });

  test('moveFile moves file between pairs', () => {
    const pair1: FastqPair = {name: 'a', pair: [new File([], 'sample_1.fastq'), null], pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1}, n:1};
    const pair2: FastqPair = {name: 'sample', pair: [new File([], 'sample_2.fastq'), null], pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1}, n:1};
    const moved = moveFile([pair1, pair2], {index:0,fileName:'sample_1.fastq'}, {index:1});
    expect(moved[0].n).toBe(2);
  });

  test('removeFile deletes file from pair', () => {
    const pair: FastqPair = {name:'a', pair:[new File([], 'a.fastq'), null], pattern:{delimiter:null,diffOffset:-1,posPairedMarker:-1,reverse:-1}, n:1};
    const updated = removeFile([pair],0,'a.fastq');
    expect(updated).toHaveLength(0);
  });

  test('splicePair splits into two singles', () => {
    const pair: FastqPair = {name:'a', pair:[new File([], 'a_1.fastq'), new File([], 'a_2.fastq')], pattern:{delimiter:'_',diffOffset:1,posPairedMarker:0,reverse:-1}, n:2};
    const result = splicePair([pair],0);
    expect(result).toHaveLength(2);
  });
});
