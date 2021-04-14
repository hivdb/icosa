import React from 'react';


function MultilineGeneRange({
  config: {geneDisplay},
  geneSeq: {firstAA, lastAA, gene}
}) {
  return <>
    <dt>Sequence includes {geneDisplay[gene.name] || gene.name} gene:</dt>
    <dd>codons {firstAA} - {lastAA}</dd>
  </>;
}

export default React.memo(MultilineGeneRange);
