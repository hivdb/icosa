import React from 'react';

/**
 * Properties for the {@link GeneMutations} component.
 *
 * @param config - Application configuration including gene display map.
 * @param geneSeq - Gene sequence with mutation information.
 */
export interface GeneMutationsProps {
  config: {
    geneDisplay: Record<string, string>;
  };
  geneSeq: {
    gene: {name: string};
    mutations: Array<{
      isUnsequenced: boolean;
      text: string;
    }>;
  };
}

/**
 * Display a list of mutations for a given gene sequence.
 *
 * @param props - {@link GeneMutationsProps} containing configuration and the
 *   gene sequence to summarise.
 * @returns Definition list entries describing gene mutations.
 */
function GeneMutations({
  config: {geneDisplay},
  geneSeq: {gene, mutations}
}: GeneMutationsProps) {
  return <>
    <dt>{geneDisplay[gene.name] || gene.name} mutations:</dt>
    <dd>
      {mutations
        .filter(({isUnsequenced}) => !isUnsequenced)
        .map(({text}) => text)
        .join(', ') || 'None'
      }
    </dd>
  </>;
}

export default React.memo(GeneMutations);
