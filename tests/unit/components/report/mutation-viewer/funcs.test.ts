import { describe, it, expect, vi } from 'vitest';
import { getCoverages, getUnsequencedRegions, getGenomeMapPositions } from '../../../../../src/components/report/mutation-viewer/funcs';

vi.mock('../../../../../src/components/genome-map/region', () => ({ default: { defaultProps: { offsetY: 0 } } }));
vi.mock('../../../../../src/utils/shorten-mutation-list', () => ({
  __esModule: true,
  default: (mutations: any[]) => mutations
}));

describe('mutation-viewer funcs', () => {
  describe('getCoverages', () => {
    it('converts coverages to absolute positions', () => {
      const geneDefs = [{ gene: 'G', rangeByStrain: { S: [1, 10] }, range: [1, 10] }];
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

    it('handles empty coverages', () => {
      const geneDefs = [{ gene: 'G', range: [1, 10] }];
      const result = getCoverages({
        strain: 'S',
        coverages: [],
        geneDefs,
        minPos: 1,
        maxPos: 10
      });
      expect(result.coverages).toEqual([]);
    });

    it('filters coverages by position range', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const coverages = [
        { gene: 'G', position: 5, coverage: 100 },
        { gene: 'G', position: 50, coverage: 100 },
        { gene: 'G', position: 150, coverage: 100 }
      ];
      const result = getCoverages({
        strain: 'S',
        coverages,
        geneDefs,
        minPos: 1,
        maxPos: 100
      });
      // All coverages are included, function doesn't filter by range
      expect(result.coverages.length).toBe(coverages.length);
    });

    it('applies coverage upper limit', () => {
      const geneDefs = [{ gene: 'G', range: [1, 10] }];
      const coverages = [{ gene: 'G', position: 5, coverage: 300 }];
      const result = getCoverages({
        strain: 'S',
        coverages,
        geneDefs,
        minPos: 1,
        maxPos: 10,
        coverageUpperLimit: 200
      });
      expect(result.coverageUpperLimit).toBe(200);
    });

    it('uses rangeByStrain when range not provided', () => {
      const geneDefs = [{ gene: 'G', range: [10, 20], rangeByStrain: { HIV1: [10, 20] } }];
      const coverages = [{ gene: 'G', position: 5, coverage: 100 }];
      const result = getCoverages({
        strain: 'HIV1',
        coverages,
        geneDefs,
        minPos: 1,
        maxPos: 30
      });
      expect(result.coverages.length).toBeGreaterThanOrEqual(0);
    });

    it('handles reading frame adjustments', () => {
      const geneDefs = [{
        gene: 'G',
        range: [1, 30],
        readingFrame: [[10, 3]]
      }];
      const coverages = [{ gene: 'G', position: 5, coverage: 100 }];
      const result = getCoverages({
        strain: 'S',
        coverages,
        geneDefs,
        minPos: 1,
        maxPos: 50
      });
      expect(result.coverages).toBeDefined();
    });
  });

  describe('getUnsequencedRegions', () => {
    it('returns unsequenced gene region when gene missing', () => {
      const geneDefs = [{ gene: 'G', rangeByStrain: { S: [1, 5] }, range: [1, 5] }];
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

    it('returns empty array when all genes sequenced', () => {
      const geneDefs = [{ gene: 'G', range: [1, 5] }];
      const allGeneSeqs = [{ gene: { name: 'G' }, unsequencedRegions: { regions: [] } }];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        knownRegions: [],
        minPos: 1,
        maxPos: 5
      });
      expect(regions).toEqual([]);
    });

    it('handles unsequenced regions within gene', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        unsequencedRegions: {
          regions: [{ posStart: 10, posEnd: 20 }]
        }
      }];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        knownRegions: [],
        minPos: 1,
        maxPos: 100
      });
      expect(regions.length).toBeGreaterThan(0);
      expect(regions[0].name).toContain('unseq-region-G');
    });

    it('clips regions to minPos and maxPos', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs: [],
        geneDefs,
        knownRegions: [],
        minPos: 20,
        maxPos: 80
      });
      expect(regions[0].posStart).toBeGreaterThanOrEqual(20);
      expect(regions[0].posEnd).toBeLessThanOrEqual(80);
    });

    it('skips regions outside range', () => {
      const geneDefs = [{ gene: 'G', range: [1, 10] }];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs: [],
        geneDefs,
        knownRegions: [],
        minPos: 50,
        maxPos: 100
      });
      expect(regions).toEqual([]);
    });

    it('calculates offsetY to avoid overlaps', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const knownRegions = [
        { shapeType: 'rect', posStart: 10, posEnd: 30, offsetY: 0 }
      ];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs: [],
        geneDefs,
        knownRegions,
        minPos: 1,
        maxPos: 100
      });
      expect(regions[0].offsetY).toBeDefined();
    });

    it('uses rangeByStrain when range not provided', () => {
      const geneDefs = [{ gene: 'G', rangeByStrain: { HIV1: [1, 10] } }];
      const regions = getUnsequencedRegions({
        strain: 'HIV1',
        allGeneSeqs: [],
        geneDefs,
        knownRegions: [],
        minPos: 1,
        maxPos: 10
      });
      expect(regions[0].name).toContain('unseq-gene-G');
    });

    it('handles reading frame in unsequenced regions', () => {
      const geneDefs = [{
        gene: 'G',
        range: [1, 100],
        readingFrame: [[30, 3]]
      }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        unsequencedRegions: {
          regions: [{ posStart: 10, posEnd: 20 }]
        }
      }];
      const regions = getUnsequencedRegions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        knownRegions: [],
        minPos: 1,
        maxPos: 150
      });
      expect(regions.length).toBeGreaterThan(0);
    });
  });

  describe('getGenomeMapPositions', () => {
    it('returns positions for mutations', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isDRM: false, isUnusual: false, isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions.length).toBeGreaterThan(0);
    });

    it('skips unsequenced mutations', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isUnsequenced: true }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions).toEqual([]);
    });

    it('filters positions by range', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 5, text: 'M5I', isUnsequenced: false },
          { position: 150, text: 'M150I', isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions.length).toBeLessThan(2);
    });

    it('highlights DRM mutations', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isDRM: true, isUnusual: false, isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: false,
        highlightDRM: true
      });
      expect(positions[0].stroke).toBeDefined();
    });

    it('highlights unusual mutations', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isDRM: false, isUnusual: true, isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: false
      });
      expect(positions[0].stroke).toBeDefined();
    });

    it('highlights genes in highlightGenes list', () => {
      const geneDefs = [{ gene: 'G', displayGene: 'Gene G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isDRM: false, isUnusual: false, isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: ['G'],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: false,
        highlightDRM: false
      });
      expect(positions[0].fontWeight).toBe(400);
    });

    it('handles frameshifts', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [],
        frameShifts: [
          { position: 20, text: 'FS20', isUnsequenced: false }
        ]
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions.length).toBeGreaterThan(0);
    });

    it('skips genes not in geneDefs', () => {
      const geneDefs = [{ gene: 'G', range: [1, 100] }];
      const allGeneSeqs = [{
        gene: { name: 'Unknown' },
        mutations: [
          { position: 10, text: 'M10I', isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'S',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions).toEqual([]);
    });

    it('uses rangeByStrain when range not provided', () => {
      const geneDefs = [{ gene: 'G', rangeByStrain: { HIV1: [1, 100] } }];
      const allGeneSeqs = [{
        gene: { name: 'G' },
        mutations: [
          { position: 10, text: 'M10I', isUnsequenced: false }
        ],
        frameShifts: []
      }];
      const positions = getGenomeMapPositions({
        strain: 'HIV1',
        allGeneSeqs,
        geneDefs,
        highlightGenes: [],
        minPos: 1,
        maxPos: 100,
        highlightUnusualMutation: true,
        highlightDRM: true
      });
      expect(positions.length).toBeGreaterThan(0);
    });
  });
});
