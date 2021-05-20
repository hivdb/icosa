import React from 'react';

export default function useExtendVariables({
  config,
  match
}) {
  return React.useCallback(
    vars => {
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
