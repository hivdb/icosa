import React from 'react';
import ConfigContext from '../config-context';

import GeneMutationList from './gene-mutation-list';
import style from './style.module.scss';


function MutationList({
  allGeneMutations,
  allGeneSequenceReads,
  alignedGeneSequences
}) {
  const geneSeqs = (
    allGeneSequenceReads ||  // seqReads analysis
    alignedGeneSequences ||  // sequence analysis
    allGeneMutations         // pattern analysis
  );

  return <ConfigContext.Consumer>
    {({geneDisplay}) => <ul className={style['mutation-list']}>
      {geneSeqs.map((geneSeq, idx) => (
        <GeneMutationList
         key={idx} {...geneSeq}
         geneDisplay={geneDisplay} />
      ))}
    </ul>}
  </ConfigContext.Consumer>;
}


export default MutationList;
