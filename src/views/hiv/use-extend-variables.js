import React from 'react';

export default function useExtendVariables({
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
      return vars;
    },
    [match]
  );
}
