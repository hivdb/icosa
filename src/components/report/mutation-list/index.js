import React from 'react';
import PropTypes from 'prop-types';
import ConfigContext from '../../../utils/config-context';

import GeneMutationList from './gene-mutation-list';
import style from './style.module.scss';


MutationList.propTypes = {
  allGeneMutations: PropTypes.array,
  allGeneSequenceReads: PropTypes.array,
  alignedGeneSequences: PropTypes.array
};

function MutationList({
  allGeneMutations,
  allGeneSequenceReads,
  alignedGeneSequences
}) {
  const geneSeqs = (
    allGeneSequenceReads || // seqReads analysis
    alignedGeneSequences || // sequence analysis
    allGeneMutations // pattern analysis
  );

  const [config] = ConfigContext.use();
  const {geneDisplay} = config || {};

  return <ul className={style['mutation-list']}>
    {geneSeqs.map(geneSeq => (
      <GeneMutationList
       key={geneSeq.gene.name}
       {...geneSeq}
       config={config}
       geneDisplay={geneDisplay} />
    ))}
  </ul>;
}


export default MutationList;
