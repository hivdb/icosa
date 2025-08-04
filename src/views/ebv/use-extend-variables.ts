import React from 'react';

/**
 * Hook returning a memoized identity function for GraphQL variables.
 *
 * @returns A function that returns its input variables unchanged.
 */
export default function useExtendVariables<T = any>(): (vars: T) => T {
  return React.useCallback((vars: T) => vars, []);
}
