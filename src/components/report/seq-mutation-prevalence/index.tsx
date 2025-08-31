import React from 'react';

import {
  mutationPrevalencesToTableData
} from './common';
import GeneMutationPrevalence from './gene-mutation-prevalence';

import type {DRComments} from '../dr-comment-by-types';
import type {SubtypeStat, PrevalenceEntry} from './types';

/**
 * Display sequence mutation prevalence tables grouped by gene.
 *
 * @param subtypeStats - Statistics for each subtype.
 * @param mutationPrevalences - Mutation prevalence data.
 * @param drugResistance - Drug resistance information per gene.
 * @returns Fragment containing tables for each gene.
 */
export interface SeqMutationPrevalenceProps {
  subtypeStats: SubtypeStat[];
  mutationPrevalences: PrevalenceEntry[];
  drugResistance: DRComments[];
}

export default function SeqMutationPrevalence({
  subtypeStats,
  mutationPrevalences,
  drugResistance
}: SeqMutationPrevalenceProps) {
  const rowsByGenes = React.useMemo(
    () => mutationPrevalencesToTableData(mutationPrevalences, subtypeStats),
    [mutationPrevalences, subtypeStats]
  );
  const filteredSubtypeStats = React.useMemo(
    () => subtypeStats.filter(({name}) => !(/^(All|Other)$/.test(name))),
    [subtypeStats]
  );
  const mutCommentsByGene = drugResistance
    .reduce<Record<string, DRComments>>((acc, geneDR) => {
      acc[geneDR.gene.name] = geneDR;
      return acc;
    }, {});

  return (
    <>
      {Object.entries(rowsByGenes).map(([gene, rows]) => (
        <GeneMutationPrevalence
         key={gene}
         gene={gene}
         subtypeStats={filteredSubtypeStats}
         mutationComments={mutCommentsByGene[gene]}
         data={rows} />
      ))}
    </>
  );
}
