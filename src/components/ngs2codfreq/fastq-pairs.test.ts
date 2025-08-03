import {identifyPairs, moveFile, removeFile, splicePair} from './fastq-pairs';

describe('fastq-pairs utilities', () => {
  it('identifies paired and single fastq files', () => {
    const files = [
      {name: 'sample_1.fastq'},
      {name: 'sample_2.fastq'},
      {name: 'lonely.fastq'}
    ];
    const result = [...identifyPairs(files)];
    expect(result[0].n).toBe(2);
    expect(result[0].name).toBe('sample');
    expect(result[1].n).toBe(1);
  });

  it('moves file between groups', () => {
    const groups = [...identifyPairs([
      {name: 'a_1.fastq'},
      {name: 'a_2.fastq'},
      {name: 'b.fastq'}
    ])];
    const moved = moveFile(groups, {index: 0, fileName: 'a_2.fastq'}, {index: 1});
    expect(moved[1].n).toBe(2);
    expect(moved[1].pair[0]?.name).toBe('a_2.fastq');
  });

  it('removes file from group', () => {
    let groups = [...identifyPairs([
      {name: 'x_1.fastq'},
      {name: 'x_2.fastq'}
    ])];
    groups = removeFile(groups, 0, 'x_1.fastq');
    expect(groups[0].n).toBe(1);
  });

  it('splits paired group into singles', () => {
    let groups = [...identifyPairs([
      {name: 'y_1.fastq'},
      {name: 'y_2.fastq'}
    ])];
    groups = splicePair(groups, 0);
    expect(groups).toHaveLength(2);
    expect(groups[0].n).toBe(1);
    expect(groups[1].n).toBe(1);
  });
});
