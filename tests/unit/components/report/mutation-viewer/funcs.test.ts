import { describe, it, expect, vi } from 'vitest';
import { getCoverages, getUnsequencedRegions } from '../../../../../src/components/report/mutation-viewer/funcs';

vi.mock('../../../../../src/components/genome-map/region', () => ({ default: { defaultProps: { offsetY: 0 } } }));

describe('mutation-viewer funcs', () => {
  it('converts coverages to absolute positions', () => {
    const geneDefs = [{ gene: 'G', rangeByStrain: { S: [1, 10] }, range: [1,10] }];
    const coverages = [{ gene: 'G', position: 1, coverage: 100 }];
    const result = getCoverages({
      strain: 'S',
      coverages,
      geneDefs,
      minPos: 1,
      maxPos: 10,
      coverageUpperLimit: 200
    });
    expect(result.coverages[0].position).toBe(1);
  });

  it('returns unsequenced gene region when gene missing', () => {
    const geneDefs = [{ gene: 'G', rangeByStrain: { S: [1, 5] }, range: [1,5] }];
    const regions = getUnsequencedRegions({
      strain: 'S',
      allGeneSeqs: [],
      geneDefs,
      knownRegions: [],
      minPos: 1,
      maxPos: 5
    });
    expect(regions[0].name).toContain('unseq-gene-G');
  });
});
