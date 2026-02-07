import {describe, expect, it, vi} from 'vitest';
import assembledConsensus from '../../../../src/components/tabular-report/assembled-consensus';
import mutationList from '../../../../src/components/tabular-report/mutation-list';
import prettyAlignments from '../../../../src/components/tabular-report/pretty-alignments';
import rawJSON from '../../../../src/components/tabular-report/raw-json';
import unseqRegions from '../../../../src/components/tabular-report/unseq-regions';

describe('tabular report helpers', () => {
  it('creates consensus FASTA sequences', () => {
    const result = assembledConsensus({
      sequenceReadsAnalysis: [{
        name: 'seq1',
        assembledConsensus: 'ACGT',
        assembledUnambiguousConsensus: 'ACGT',
        maxMixtureRate: 0.1,
        minPrevalence: 0.2,
        minPositionReads: 10
      }]
    });
    expect(result).toHaveLength(2);
    expect(result[0].payload).toContain('>seq1');
  });

  it('lists simple mutations', () => {
    const tables = mutationList({
      sequenceAnalysis: [{
        name: 'seq1',
        alignedGeneSequences: [{
          gene: {name: 'G'},
          mutations: [{
            reference: 'A',
            AAs: 'T',
            unusualAAs: new Set(['T']),
            position: 1,
            triplet: 'ACT',
            isUnsequenced: false
          }]
        }]
      }]
    });
    expect(tables[0].rows[0]['Mutation']).toBe('G:A1T');
  });

  it('generates pretty alignments', () => {
    const tables = prettyAlignments({
      allGenes: [{name: 'G', refSequence: 'A', length: 1}],
      sequenceAnalysis: [{
        name: 'seq1',
        alignedGeneSequences: [{
          gene: {name: 'G'},
          mutations: [{position: 1, displayAAs: 'T', isUnsequenced: false}],
          unsequencedRegions: {regions: []}
        }]
      }],
      config: {geneDisplay: {}}
    });
    expect(tables[0].rows[1]['1']).toBe('T');
  });

  it('exports raw JSON', () => {
    const jsons = rawJSON({
      allGenes: [],
      currentVersion: {},
      currentProgramVersion: {},
      sequenceAnalysis: [{name: 'seq1'}]
    });
    expect(jsons[0].tableName).toContain('Raw_');
  });

  it('records unsequenced regions', () => {
    const tables = unseqRegions({
      sequenceAnalysis: [{
        name: 'seq1',
        alignedGeneSequences: [{
          gene: {name: 'G'},
          unsequencedRegions: {regions: [{posStart: 1, posEnd: 2}]}
        }]
      }]
    });
    expect(tables[0].rows[0]['Position Start']).toBe(1);
  });
});
