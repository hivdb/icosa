import React from 'react';

import Mutation from '../../mutation';
import style from './style.module.scss';
import shortenMutationList from '../../../utils/shorten-mutation-list';

/**
 * Displays mutations for a specific gene.
 *
 * @param config - Global configuration object.
 * @param geneDisplay - Mapping from gene name to display name.
 * @param gene - Gene information containing a name field.
 * @param mutations - List of mutation objects for the gene.
 * @returns List item containing mutation entries when available.
 */
export interface GeneMutationListProps {
  config: any;
  geneDisplay: Record<string, string>;
  gene: {name: string};
  mutations: any[];
}

export default function GeneMutationList({
  config,
  geneDisplay,
  gene: {name: geneName},
  mutations
}: GeneMutationListProps) {
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
