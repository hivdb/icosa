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


export function getUnsequencedRegions(allGeneSeqs, geneDefs, knownRegions) {
  const regions = [];
  const commonProps = {
    label: null,
    fill: '#ff1100',
    shapeType: 'wavy',
    wavyRepeats: 5
  };
  for (const geneDef of geneDefs) {
    const {gene, range, readingFrame} = geneDef;
    const geneSeq = allGeneSeqs.find(({gene: {name}}) => name === gene);
    if (typeof geneSeq === 'undefined') {
      const [posStart, posEnd] = range;
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
        posEnd = convertAAPosToAbsNAPos(posEnd, range[0], readingFrame);
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


export function getGenomeMapPositions(allGeneSeqs, geneDefs, highlightGenes) {
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
    const {
      displayGene, range,
      readingFrame
    } = geneDefs[geneName];
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
      resultPositions.push({
        gene: displayGene,
        name: highlight ? text : `${displayGene}:${text}`,
        pos: absNAPos,
        ...(highlight ? {
          strokeWidth: isDRM ? 4 : (isUnusual ? 2 : 1),
          fontWeight: isDRM ? 600 : 400,
          stroke: isUnusual ? '#e13333' : (isDRM ? '#1b8ecc' : '#000000'),
          color: isUnusual ? '#e13333' : (isDRM ? '#1b8ecc' : '#000000')
        } : {
          stroke: '#e0e0e0',
          color: '#a0a0a0'
        })
      });
    }

    for (const {
      position,
      text
    } of frameShifts) {
      const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
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


export function getCoverages(coverages, geneDefs, coverageUpperLimit) {
  if (!coverages) {
    return;
  }
  const posStart = Math.min(...geneDefs.map(({range}) => range[0]));
  const posEnd = Math.max(...geneDefs.map(({range}) => range[1]));
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const results = [];
  for (const {gene, position, coverage} of coverages) {
    const {range, readingFrame} = geneDefs[gene];
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