import React from 'react';
import ConfigContext from '../config-context';

import GeneMutationList from './gene-mutation-list';
import style from './style.module.scss';


function MutationList({
  allGeneSequenceReads,
  alignedGeneSequences
}) {
  const geneSeqs = allGeneSequenceReads || alignedGeneSequences;

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
