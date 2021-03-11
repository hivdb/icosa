import React from 'react';

import GenomeMap from '../../genome-map';
import GMRegion from '../../genome-map/region';
import PromiseComponent from '../../../utils/promise-component';
import {consecutiveGroupsBy} from '../../../utils/array-groups';
import ConfigContext from '../config-context';


function mergeDeletions(positions) {
  const merged = [];
  const groups = consecutiveGroupsBy(
    positions,
    (left, right) => (
      left.AAs === right.AAs &&
      left.AAs === '-' &&
      left.gene === right.gene &&
      left.aaPos === right.aaPos - 1
    )
  );
  for (const group of groups) {
    if (group.length === 1) {
      const [{gene, name, pos, stroke, color}] = group;
      merged.push({
        name: `${gene}:${name.replace('Deletion', 'Δ')}`,
        pos,
        stroke,
        color
      });
    }
    else {
      const leftest = group[0];
      const rightest = group[group.length - 1];
      const {gene, pos, stroke, color, aaPos: startPos} = leftest;
      const {aaPos: endPos} = rightest;
      const refAAs = group.map(({refAA}) => refAA).join('');
      merged.push({
        name: `${gene}:${refAAs}${startPos}-${endPos}Δ`,
        pos, stroke, color
      });
    }
  }
  return merged;
}


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
  return offsetY;
}


function getUnsequencedRegions(allGeneSeqs, geneDefs, knownRegions) {
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
      const {unsequencedRegions} = geneSeq;
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


function getGenomeMapPositions(allGeneSeqs, geneDefs) {
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions = [];
  for (const geneSeq of allGeneSeqs) {
    const {gene: {name: geneName}, mutations} = geneSeq;
    const {
      displayGene, range,
      readingFrame, stroke, color
    } = geneDefs[geneName];

    for (const {
      position,
      reference: refAA,
      AAs,
      text,
      isUnsequenced
    } of mutations) {
      if (isUnsequenced) {
        continue;
      }
      const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
      resultPositions.push({
        gene: displayGene,
        name: text,
        pos: absNAPos,
        stroke, color,
        aaPos: position,
        refAA,
        AAs
      });
    }
  }
  return mergeDeletions(resultPositions);
}


function MutationViewer({
  regionPresets,
  allGeneSeqs
}) {
  const {presets, genes} = regionPresets;
  const [{preset: {minHeight, regions, ...preset}}] = presets;
  const payload = {
    ...preset,
    regions: [
      ...regions,
      ...getUnsequencedRegions(allGeneSeqs, genes, regions)
    
       
      
    ],
    height: minHeight,
    positionGroups: [{
      name: 'NA',
      label: '',
      positions: getGenomeMapPositions(allGeneSeqs, genes)
    }]
  };
  return <GenomeMap preset={payload} />;
}


export default function MutationViewerLoader(props) {

  return <ConfigContext.Consumer>
    {({loadRegionPresets}) => (
      <PromiseComponent
       promise={loadRegionPresets()}
       then={(regionPresets) => (
         <MutationViewer {...props} regionPresets={regionPresets} />
       )} />
    )}
  </ConfigContext.Consumer>;
}
