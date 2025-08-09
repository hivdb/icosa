import React from 'react';

interface ExtendVariableArgs {
  /** Configuration object containing version information. */
  config: Record<string, any>;
  /** Router match object holding the current location state. */
  match: {
    location: {
      state?: {algorithm?: string};
    };
  };
}

/**
 * Hook returning a function that enriches GraphQL variables with additional
 * context information such as algorithm and version identifiers.
 *
 * @param args Configuration and routing match information.
 * @returns Callback that augments the provided variables object.
 */
export default function useExtendVariables({
  config,
  match
}: ExtendVariableArgs): (vars: Record<string, any>) => Record<string, any> {
  return React.useCallback(
    (vars: Record<string, any>) => {
      const {
        location: {
          state: {algorithm} = {}
        }
      } = match;
      vars.algorithm = algorithm;
      vars.drdbVersion = config.drdbVersion;
      vars.cmtVersion = config.cmtVersion;
      return vars;
    },
    [config, match]
  );
}
