import React from 'react';
import ConfigContext from '../../../utils/config-context';

import GeneMutationList from './gene-mutation-list';
import style from './style.module.scss';
import type {MutationListProps, AppConfig} from './types';

/**
 * Type guard to check if config has required MutationConfig fields.
 */
function isValidConfig(config: Record<string, unknown> | null): config is AppConfig {
  return (
    config !== null &&
    typeof config === 'object' &&
    'geneDisplay' in config &&
    'messages' in config &&
    typeof config.geneDisplay === 'object' &&
    typeof config.messages === 'object'
  );
}

/**
 * Renders mutation lists grouped by gene.
 *
 * @param allGeneMutations - Mutations grouped by gene for pattern analysis.
 * @param allGeneSequenceReads - Gene sequence reads for seqReads analysis.
 * @param alignedGeneSequences - Aligned gene sequences for sequence analysis.
 * @returns Unordered list of gene mutation lists.
 */
function MutationList({
  allGeneMutations,
  allGeneSequenceReads,
  alignedGeneSequences
}: MutationListProps) {
  const geneSeqs = (
    allGeneSequenceReads || // seqReads analysis
    alignedGeneSequences || // sequence analysis
    allGeneMutations // pattern analysis
  ) || [];

  const [config] = ConfigContext.use();

  if (!isValidConfig(config)) {
    return <ul className={style['mutation-list']} />;
  }

  const {geneDisplay} = config;

  return <ul className={style['mutation-list']}>
    {geneSeqs.map(geneSeq => (
      <GeneMutationList
       key={geneSeq.gene.name}
       {...geneSeq}
       config={config}
       geneDisplay={geneDisplay} />
    ))}
  </ul>;
}

export default MutationList;
