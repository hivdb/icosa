import React from 'react';
import style from './style.module.scss';

/**
 * Properties for the {@link MultilineGeneRange} component.
 */
export interface MultilineGeneRangeProps {
  config: {geneDisplay: Record<string, string>};
  geneSeq: {
    firstAA: number;
    lastAA: number;
    gene: {name: string};
    unsequencedRegions: {
      size: number;
      regions: Array<{posStart: number; posEnd: number}>;
    };
  };
}

/**
 * Display the covered codon range for a gene sequence and highlight missing
 * regions if present.
 *
 * @param props - {@link MultilineGeneRangeProps} describing gene coverage.
 * @returns Definition list entries for gene range coverage.
 */
function MultilineGeneRange({
  config: {geneDisplay},
  geneSeq: {
    firstAA,
    lastAA,
    gene,
    unsequencedRegions: {size, regions}
  }
}: MultilineGeneRangeProps) {
  return <>
    <dt>Sequence includes {geneDisplay[gene.name] || gene.name}:</dt>
    <dd>
      codons {firstAA} - {lastAA}
      {size > 0 ? <span className={style['unseq-region']}>
        {' (missing: '}
        {regions.map(
          ({posStart, posEnd}) => posStart < posEnd ?
            `${posStart}-${posEnd}` : posStart
        ).join(', ')})
      </span> : null}
    </dd>
  </>;
}

export default React.memo(MultilineGeneRange);
