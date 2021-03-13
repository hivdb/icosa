import React from 'react';

import ConfigContext from '../config-context';


export default function GeneMutations({geneSeq: {gene, mutations}}) {
  return <ConfigContext.Consumer>
    {({geneDisplay}) => <>
      <dt>{geneDisplay[gene.name] || gene.name} mutations:</dt>
      <dd>
        {mutations
          .filter(({isUnsequenced}) => !isUnsequenced)
          .map(({text}) => text).join(', ') || 'None'
        }
      </dd>
    </>}
  </ConfigContext.Consumer>;
}
