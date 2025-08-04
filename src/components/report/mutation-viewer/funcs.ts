import GMRegion from '../../genome-map/region';
import shortenMutationList from '../../../utils/shorten-mutation-list';

export type ReadingFrame = Array<[number, number]>;

/**
 * Convert an amino acid position to absolute nucleotide position.
 *
 * @param aaPos - Amino acid position (1-based)
 * @param naPosStart - Starting nucleotide position for the gene
 * @param readingFrame - Optional reading frame adjustments
 * @returns Absolute nucleotide position
 */
function convertAAPosToAbsNAPos(
  aaPos: number,
  naPosStart: number,
  readingFrame?: ReadingFrame
): number {
  let absNAPos = naPosStart - 3 + aaPos * 3;
  if (readingFrame && readingFrame.length > 0) {
    for (const [breakpoint, offset] of readingFrame) {
      if (absNAPos > breakpoint) {
        absNAPos += offset;
      }
    }
  }
  return absNAPos;
}

/**
 * Calculate vertical offset for an unsequenced region to avoid overlap.
 *
 * @param knownRegions - Existing regions on the map
 * @param posStart - Start nucleotide position
 * @param posEnd - End nucleotide position
 * @returns Offset value for the region
 */
function calcUnseqRegionOffsetY(
  knownRegions: any[],
  posStart: number,
  posEnd: number
): number {
  const regionSize = posEnd - posStart;
  const maxAllowedOverlap = regionSize / 10;
  let offsetY = GMRegion.defaultProps.offsetY;
  for (const {
    shapeType,
    posStart: krPosStart,
    posEnd: krPosEnd,
    offsetY: krOffsetY = GMRegion.defaultProps.offsetY
  } of knownRegions) {
    if (shapeType !== 'rect') {
      // only need to avoid rect shapes
      continue;
    }
    if (
      posEnd < krPosStart + maxAllowedOverlap ||
      posStart > krPosEnd - maxAllowedOverlap
    ) {
      // not overlapped
      continue;
    }
    offsetY = Math.max(offsetY, krOffsetY);
  }
  // minus 10 to have some overlap with rect regions
  return offsetY - 10;
}

interface GetUnseqParams {
  strain: string;
  allGeneSeqs: any[];
  geneDefs: any[];
  knownRegions: any[];
  minPos: number;
  maxPos: number;
}

/**
 * Generate unsequenced regions to be rendered on the genome map.
 *
 * @param args - {@link GetUnseqParams} configuration
 * @returns List of unsequenced regions
 */
export function getUnsequencedRegions({
  strain,
  allGeneSeqs,
  geneDefs,
  knownRegions,
  minPos,
  maxPos
}: GetUnseqParams): any[] {
  const regions: any[] = [];
  const commonProps = {
    label: null,
    fill: '#ff1100',
    shapeType: 'wavy',
    wavyRepeats: 5
  };
  for (const geneDef of geneDefs) {
    const { gene, rangeByStrain, readingFrame } = geneDef;
    const range = geneDef.range ? geneDef.range : rangeByStrain[strain];
    const geneSeq = allGeneSeqs.find(({ gene: { name } }) => name === gene);
    if (typeof geneSeq === 'undefined') {
      let [posStart, posEnd] = range;
      posStart = Math.max(posStart, minPos);
      posEnd = Math.min(posEnd, maxPos);
      if (posStart > posEnd) {
        continue;
      }
      regions.push({
        ...commonProps,
        name: `unseq-gene-${gene}`,
        posStart,
        posEnd,
        offsetY: calcUnseqRegionOffsetY(knownRegions, posStart, posEnd)
      });
    } else {
      const { unsequencedRegions = { regions: [] } } = geneSeq;
      for (let { posStart, posEnd } of unsequencedRegions.regions) {
        posStart = convertAAPosToAbsNAPos(posStart, range[0], readingFrame);
        posEnd = convertAAPosToAbsNAPos(posEnd, range[0], readingFrame) + 2;
        posStart = Math.max(posStart, minPos);
        posEnd = Math.min(posEnd, maxPos);
        if (posStart > posEnd) {
          continue;
        }
        regions.push({
          ...commonProps,
          name: `unseq-region-${gene}-${posStart}-${posEnd}`,
          posStart,
          posEnd,
          offsetY: calcUnseqRegionOffsetY(knownRegions, posStart, posEnd)
        });
      }
    }
  }
  return regions;
}

interface GenomeMapPositionsParams {
  strain: string;
  allGeneSeqs: any[];
  geneDefs: any[];
  highlightGenes: string[];
  minPos: number;
  maxPos: number;
  highlightUnusualMutation: boolean;
  highlightDRM: boolean;
}

/**
 * Calculate positions of mutations and frameshifts for genome map rendering.
 *
 * @param args - {@link GenomeMapPositionsParams} configuration
 * @returns Array of position descriptors
 */
export function getGenomeMapPositions({
  strain,
  allGeneSeqs,
  geneDefs,
  highlightGenes,
  minPos,
  maxPos,
  highlightUnusualMutation: hlUM,
  highlightDRM: hlDRM
}: GenomeMapPositionsParams): any[] {
  geneDefs = geneDefs.reduce((acc: any, geneDef: any) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions: any[] = [];
  for (const geneSeq of allGeneSeqs) {
    const { gene: { name: geneName }, mutations, frameShifts } = geneSeq;
    if (!(geneName in geneDefs)) {
      continue;
    }
    const geneDef = geneDefs[geneName];
    const { displayGene, rangeByStrain, readingFrame } = geneDef;
    const range = geneDef.range ? geneDef.range : rangeByStrain[strain];
    const highlight = highlightGenes.includes(geneName);
    const shortMutations = shortenMutationList(mutations);

    for (const {
      position,
      text,
      isDRM,
      isUnusual,
      isUnsequenced
    } of shortMutations) {
      if (isUnsequenced) {
        continue;
      }
      const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
      if (absNAPos < minPos || absNAPos > maxPos) {
        continue;
      }
      resultPositions.push({
        gene: displayGene,
        name: highlight ? text : `${displayGene}:${text}`,
        pos: absNAPos,
        ...(highlight
          ? {
              strokeWidth: hlDRM && isDRM ? 3 : hlUM && isUnusual ? 1.5 : 1,
              fontWeight: hlDRM && isDRM ? 600 : 400,
              stroke: hlUM && isUnusual ? '#e13333' : hlDRM && isDRM ? '#1b8ecc' : '#000000',
              color: hlUM && isUnusual ? '#e13333' : hlDRM && isDRM ? '#1b8ecc' : '#000000'
            }
          : {
              stroke: '#e0e0e0',
              color: '#a0a0a0'
            })
      });
    }

    for (const { position, text } of frameShifts || []) {
      const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
      if (absNAPos < minPos || absNAPos > maxPos) {
        continue;
      }
      resultPositions.push({
        gene: displayGene,
        name: highlight ? text : `${displayGene}:${text}`,
        pos: absNAPos,
        strokeWidth: 2,
        fontWeight: 400,
        stroke: '#e13333',
        color: '#e13333'
      });
    }
  }
  return resultPositions;
}

interface GetCoveragesParams {
  strain: string;
  coverages?: Array<{ gene: string; position: number; coverage: number }>;
  geneDefs: any[];
  minPos: number;
  maxPos: number;
  coverageUpperLimit?: number;
}

/**
 * Format coverage data for genome map consumption.
 *
 * @param args - {@link GetCoveragesParams} configuration
 * @returns Coverage payload or undefined if no coverage provided
 */
export function getCoverages({
  strain,
  coverages,
  geneDefs,
  minPos,
  maxPos,
  coverageUpperLimit
}: GetCoveragesParams): any {
  if (!coverages) {
    return;
  }
  const posStart = Math.max(
    minPos,
    Math.min(...geneDefs.map(({ range }: any) => range[0]))
  );
  const posEnd = Math.min(
    maxPos,
    Math.max(...geneDefs.map(({ range }: any) => range[1]))
  );
  geneDefs = geneDefs.reduce((acc: any, geneDef: any) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const results: Array<{ position: number; coverage: number }> = [];
  for (const { gene, position, coverage } of coverages) {
    if (!(gene in geneDefs)) {
      continue;
    }
    const geneDef = geneDefs[gene];
    const { rangeByStrain, readingFrame } = geneDef;
    const range = geneDef.range ? geneDef.range : rangeByStrain[strain];
    const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
    results.push({ position: absNAPos, coverage });
  }
  return {
    height: 50,
    posStart,
    posEnd,
    coverageUpperLimit,
    coverages: results.sort((a, b) => a.position - b.position)
  };
}
