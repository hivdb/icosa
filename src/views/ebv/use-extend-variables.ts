import React from 'react';

interface UseExtendVariablesArgs {
  /** Optional configuration object; genes are unused but preserved for API parity. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config?: {allGenes: string[]};
  /** Route match information, currently unused. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match?: any;
}

/**
 * Hook returning a memoized identity function for GraphQL variables.
 *
 * The EBV implementation does not need to extend variables but keeps the
 * same call signature as other pathogens for consistency.
 *
 * @param _args - Configuration and routing context, ignored.
 * @returns A callback that returns its input variables unchanged.
 */
export default function useExtendVariables({}: UseExtendVariablesArgs = {}): <T>(vars: T) => T {
  return React.useCallback(<T,>(vars: T) => vars, []);
}
