import React from 'react';

export default function useExtendVariables({
  config
}) {
  const {allGenes} = config;
  return React.useCallback(
    vars => {
      vars.includeGenes = allGenes;
      return vars;
    },
    [allGenes]
  );
}
