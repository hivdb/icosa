import React from 'react';
import sortBy from 'lodash/sortBy';

import Mutation from './mutation';
import style from './style.module.scss';

import shortenMutationList from '../../../utils/shorten-mutation-list';


function GeneMutationList({
  geneDisplay,
  gene: {name: geneName},
  mutations,
  unsequencedRegions: {regions: unseqRegions} = {regions: []}
}) {
  const shortMutations = shortenMutationList(
    mutations.filter(({isUnsequenced}) => !isUnsequenced)
  );
  const mutWithUnseqs = sortBy([
    ...shortMutations,
    ...unseqRegions.map(unseq => ({
      text: <span className={style.unseq}>
        {unseq.posStart}..{unseq.posEnd}
      </span>,
      isUnsequenced: true,
      ...unseq
    }))
  ], ['posStart']);

  return (
    <li
     key={`${geneName}-mutation-list`}
     className={style['gene-item']}>
      <strong className={style['gene-name']}>
        {geneDisplay[geneName] || geneName}
      </strong>
      {mutWithUnseqs.length > 0 ?
        <ul className={style['gene-mutation-list']}>
          {mutWithUnseqs.map((mut, idx) => (
            <Mutation key={idx} {...mut} />
          ))}
        </ul> : 'None'}
    </li>
  );
}


export default GeneMutationList;
