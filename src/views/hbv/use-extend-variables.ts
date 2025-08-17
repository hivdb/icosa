import React from 'react';

interface UseExtendVariablesArgs {
  /** Configuration containing the list of genes to include. */
  config: {allGenes: string[]};
}

/**
 * Hook extending GraphQL variables with all gene names.
 *
 * @param args - {@link UseExtendVariablesArgs} including configuration.
 * @returns Callback that appends `includeGenes` to variables.
 */
export default function useExtendVariables({
  config
}: UseExtendVariablesArgs): <T extends Record<string, any>>(vars: T) => T {
  const {allGenes} = config;
  return React.useCallback(
    (vars: any) => {
      vars.includeGenes = allGenes;
      return vars;
    },
    [allGenes]
  );
}

