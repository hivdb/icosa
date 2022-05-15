import React from 'react';

export default function useExtendVariables({
  match,
  config
}) {
  const {allGenes} = config;
  return React.useCallback(
    vars => {
      const {
        location: {
          state: {algorithm} = {}
        }
      } = match;
      vars.algorithm = algorithm;
      vars.includeGenes = allGenes;
      return vars;
    },
    [match, allGenes]
  );
}
