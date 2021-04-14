import React from 'react';


function GeneMutations({
  config: {geneDisplay},
  geneSeq: {gene, mutations}
}) {
  return <>
    <dt>{geneDisplay[gene.name] || gene.name} mutations:</dt>
    <dd>
      {mutations
        .filter(({isUnsequenced}) => !isUnsequenced)
        .map(({text}) => text).join(', ') || 'None'
      }
    </dd>
  </>;
}

export default React.memo(GeneMutations);
