import GMRegion from '../../genome-map/region';
import shortenMutationList from '../../../utils/shorten-mutation-list';


function convertAAPosToAbsNAPos(aaPos, naPosStart, readingFrame) {
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


function calcUnseqRegionOffsetY(knownRegions, posStart, posEnd) {
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


export function getUnsequencedRegions({
  strain,
  allGeneSeqs,
  geneDefs,
  knownRegions,
  minPos,
  maxPos
}) {
  const regions = [];
  const commonProps = {
    label: null,
    fill: '#ff1100',
    shapeType: 'wavy',
    wavyRepeats: 5
  };
  for (const geneDef of geneDefs) {
    const {gene, rangeByStrain, readingFrame} = geneDef;
    const range = geneDef.range ? geneDef.range : rangeByStrain[strain];
    const geneSeq = allGeneSeqs.find(({gene: {name}}) => name === gene);
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
    }
    else {
      const {unsequencedRegions = {regions: []}} = geneSeq;
      for (let {posStart, posEnd} of unsequencedRegions.regions) {
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


export function getGenomeMapPositions({
  strain,
  allGeneSeqs,
  geneDefs,
  highlightGenes,
  minPos,
  maxPos,
  highlightUnusualMutation: hlUM,
  highlightDRM: hlDRM
}) {
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions = [];
  for (const geneSeq of allGeneSeqs) {
    const {gene: {name: geneName}, mutations, frameShifts} = geneSeq;
    if (!(geneName in geneDefs)) {
      continue;
    }
    const geneDef = geneDefs[geneName];
    const {displayGene, rangeByStrain, readingFrame} = geneDef;
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
        ...(highlight ? {
          strokeWidth: hlDRM && isDRM ? 3 : (hlUM && isUnusual ? 1.5 : 1),
          fontWeight: hlDRM && isDRM ? 600 : 400,
          stroke: hlUM && isUnusual ? '#e13333' : (
            hlDRM && isDRM ? '#1b8ecc' : '#000000'
          ),
          color: hlUM && isUnusual ? '#e13333' : (
            hlDRM && isDRM ? '#1b8ecc' : '#000000'
          )
        } : {
          stroke: '#e0e0e0',
          color: '#a0a0a0'
        })
      });
    }

    for (const {
      position,
      text
    } of frameShifts || []) {
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


export function getCoverages({
  strain,
  coverages,
  geneDefs,
  minPos,
  maxPos,
  coverageUpperLimit
}) {
  if (!coverages) {
    return;
  }
  const posStart = Math.max(
    minPos,
    Math.min(...geneDefs.map(({range}) => range[0]))
  );
  const posEnd = Math.min(
    maxPos,
    Math.max(...geneDefs.map(({range}) => range[1]))
  );
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const results = [];
  for (const {gene, position, coverage} of coverages) {
    if (!(gene in geneDefs)) {
      continue;
    }
    const geneDef = geneDefs[gene];
    const {rangeByStrain, readingFrame} = geneDef;
    const range = geneDef.range ? geneDef.range : rangeByStrain[strain];
    const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
    results.push({position: absNAPos, coverage});
  }
  return {
    height: 50,
    posStart,
    posEnd,
    coverageUpperLimit,
    coverages: results.sort((a, b) => a.position - b.position)
  };
}
