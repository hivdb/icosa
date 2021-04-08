import React from 'react';

import Mutation from './mutation';
import style from './style.module.scss';

import shortenMutationList from '../../../utils/shorten-mutation-list';


function GeneMutationList({
  geneDisplay,
  gene: {name: geneName},
  mutations
}) {
  const shortMutations = shortenMutationList(
    mutations.filter(({isUnsequenced}) => !isUnsequenced)
  );

  if (shortMutations.length > 0) {
    return (
      <li
       key={`${geneName}-mutation-list`}
       className={style['gene-item']}>
        <strong className={style['gene-name']}>
          {geneDisplay[geneName] || geneName}
        </strong>
        <ul className={style['gene-mutation-list']}>
          {shortMutations.map((mut, idx) => (
            <Mutation key={idx} {...mut} />
          ))}
        </ul>
      </li>
    );
  }
  else {
    return null;
  }
}


export default GeneMutationList;
