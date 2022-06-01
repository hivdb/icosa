import React from 'react';
import PropTypes from 'prop-types';

import Mutation from '../../mutation';
import style from './style.module.scss';

import shortenMutationList from '../../../utils/shorten-mutation-list';


GeneMutationList.propTypes = {
  config: PropTypes.object.isRequired,
  geneDisplay: PropTypes.objectOf(
    PropTypes.string.isRequired
  ).isRequired,
  gene: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  mutations: PropTypes.array.isRequired
};

export default function GeneMutationList({
  config,
  geneDisplay,
  gene: {name: geneName},
  mutations
}) {
  const shortMutations = React.useMemo(
    () => shortenMutationList(
      mutations.filter(({isUnsequenced}) => !isUnsequenced)
    ),
    [mutations]
  );

  return <>
    {shortMutations.length > 0 ?
      <li
       key={`${geneName}-mutation-list`}
       className={style['gene-item']}>
        <strong className={style['gene-name']}>
          {geneDisplay[geneName] || geneName}
        </strong>
        <ul className={style['gene-mutation-list']}>
          {shortMutations.map((mut, idx) => (
            <Mutation key={idx} {...mut} gene={geneName} config={config} />
          ))}
        </ul>
      </li> : null}
  </>;
}
