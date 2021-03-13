import React, {useState} from 'react';
import PropTypes from 'prop-types';

import GenomeMap from '../../genome-map';
import GMRegion from '../../genome-map/region';
import {consecutiveGroupsBy} from '../../../utils/array-groups';
import ConfigContext from '../config-context';
import PresetSelection from './preset-selection';

import style from './style.module.scss';


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
  // minus 10 to have some overlap with rect regions
  return offsetY - 10;
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


function getGenomeMapPositions(allGeneSeqs, geneDefs, highlightGenes) {
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions = [];
  for (const geneSeq of allGeneSeqs) {
    const {gene: {name: geneName}, mutations} = geneSeq;
    const {
      displayGene, range,
      readingFrame
    } = geneDefs[geneName];
    const highlight = highlightGenes.includes(geneName);

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
        aaPos: position,
        refAA,
        AAs,
        ...(highlight ? null : {
          stroke: '#e0e0e0',
          color: '#a0a0a0'
        })
      });
    }
  }
  return mergeDeletions(resultPositions);
}


function getCoverages(coverages, geneDefs) {
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
    coverages: results.sort((a, b) => a.position - b.position)
  };
}


function MutationViewer({
  regionPresets,
  allGeneSeqs,
  coverages
}) {
  const {presets, genes} = regionPresets;
  const [preset, setPreset] = useState(presets[0]);
  const {
    name: curName,
    highlightGenes,
    preset: {minHeight, regions, ...otherPreset}
  } = preset;
  const presetOptions = presets.map(({name, label}) => ({
    value: name, label
  }));
  const payload = {
    name: curName,
    label: '',
    ...otherPreset,
    regions: [
      ...regions,
      ...getUnsequencedRegions(allGeneSeqs, genes, regions)
    ],
    height: minHeight,
    positionGroups: [{
      name: 'NA',
      label: '',
      positions: getGenomeMapPositions(allGeneSeqs, genes, highlightGenes)
    }],
    coverages: getCoverages(coverages, genes)
  };
  return (
    <GenomeMap
     key={curName}
     preset={payload}
     className={style['sierra-genome-map']}
     extraButtons={
       <PresetSelection
        value={curName}
        options={presetOptions}
        onChange={handleChange} />
     } />
  );

  function handleChange(value) {
    const preset = presets.find(({name}) => name === value);
    setPreset(preset);
  }
}


MutationViewer.propTypes = {
  allGeneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      unsequencedRegions: PropTypes.shape({
        regions: PropTypes.arrayOf(
          PropTypes.shape({
            posStart: PropTypes.number.isRequired,
            posEnd: PropTypes.number.isRequired
          }).isRequired
        ).isRequired
      }).isRequired
    }).isRequired,
  ).isRequired,
  coverages: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
      coverage: PropTypes.number.isRequired
    }).isRequired
  )
};


export default function MutationViewerLoader(props) {

  return <ConfigContext.Consumer>
    {({regionPresets}) => (
      <MutationViewer {...props} regionPresets={regionPresets} />
    )}
  </ConfigContext.Consumer>;
}
