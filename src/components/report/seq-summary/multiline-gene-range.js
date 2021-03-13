import React from 'react';
import ConfigContext from '../config-context';


export default function MultilineGeneRange({
  geneSeq: {firstAA, lastAA, gene}
}) {
  return <ConfigContext.Consumer>
    {({geneDisplay}) => <>
      <dt>Sequence includes {geneDisplay[gene.name] || gene.name} gene:</dt>
      <dd>codons {firstAA} - {lastAA}</dd>
    </>}
  </ConfigContext.Consumer>;
}
