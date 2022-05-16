import React from 'react';
import PropTypes from 'prop-types';

import {
  mutationPrevalencesToTableData
} from './common';
import GeneMutationPrevalence from './gene-mutation-prevalence';


SeqMutationPrevalence.propTypes = {
  subtypeStats: PropTypes.array.isRequired,
  mutationPrevalences: PropTypes.array.isRequired,
  drugResistance: PropTypes.array.isRequired
};

export default function SeqMutationPrevalence({
  subtypeStats,
  mutationPrevalences,
  drugResistance
}) {
  const rowsByGenes = React.useMemo(
    () => mutationPrevalencesToTableData(mutationPrevalences, subtypeStats),
    [mutationPrevalences, subtypeStats]
  );
  const filteredSubtypeStats = React.useMemo(
    () => subtypeStats.filter(({name}) => !(/^(All|Other)$/.test(name))),
    [subtypeStats]
  );
  const mutCommentsByGene = drugResistance
    .reduce((acc, geneDR) => {
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
