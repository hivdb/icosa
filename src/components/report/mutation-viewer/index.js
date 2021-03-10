import React from 'react';
import zipWith from 'lodash/zipWith';
import PropTypes from 'prop-types';

import GenomeMap from '../../genome-map';
import PromiseComponent from '../../../utils/promise-component';
import ConfigContext from '../config-context';


function getGenomeMapPositions(alignedGeneSequences, geneDefs) {
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions = [];
  for (const geneSeq of alignedGeneSequences) {
    const {gene: {name: geneName}, mutations} = geneSeq;
    const {
      displayGene, range,
      readingFrame, stroke, color
    } = geneDefs[geneName];
    const hasReadingFrame = Boolean(readingFrame && readingFrame.length > 0);

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
      let absNAPos = range[0] - 3 + position * 3;
      if (hasReadingFrame) {
        for (const [breakpoint, offset] of readingFrame) {
          if (absNAPos > breakpoint) {
            absNAPos += offset;
          }
        }
      }
      resultPositions.push({
        name: `${displayGene}:${text.replace('Deletion', 'Δ')}`,
        pos: absNAPos,
        stroke, color,
        _geneName: geneName,
        _displayGene: displayGene,
        _genePos: position,
        _refAA: refAA,
        _AAs: AAs
      });
    }
  }
  const merged = [];
  for (let i = 0; i < resultPositions.length; i ++) {
    let left = resultPositions[i];
    for (let j = i + 1; j < resultPositions.length; j ++) {
      const right = resultPositions[j];
      if (
        right === null ||
        left._AAs !== right._AAs ||
        left._AAs !== '-' ||
        left._geneName !== right._geneName ||
        left._genePos !== right._genePos - 1
      ) {
        break;
      }
      let {
        _startGenePos = left._genePos,
        _displayGene,
        _refAA,
      } = left;
      let {_genePos} = right;
      _refAA += right._refAA;
      left = {
        ...left,
        name: `${_displayGene}:${_refAA}${_startGenePos}-${_genePos}Δ`,
        _startGenePos,
        _refAA,
        _genePos
      };
      i ++;
    }
    merged.push(left);
  }
  return merged;
}


function MutationViewer({
  regionPresets,
  sequenceResult: {alignedGeneSequences}
}) {
  const {presets, genes} = regionPresets;
  const [{preset: {minHeight, ...preset}}] = presets;
  const payload = {
    ...preset,
    height: minHeight,
    positionGroups: [{
      name: 'NA',
      label: '',
      positions: getGenomeMapPositions(alignedGeneSequences, genes)
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
