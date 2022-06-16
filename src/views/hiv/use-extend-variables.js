import React from 'react';
import BigData from '../../utils/big-data';

export default function useExtendVariables({
  match,
  config
}) {
  const {allGenes} = config;
  const [customAlgs, setCustomAlgs] = React.useState(null);

  React.useEffect(
    () => {
      const {
        location: {
          state: {
            customAlgorithms
          } = {}
        }
      } = match;
      let mounted = true;
      BigData
        .load(customAlgorithms)
        .then(algs => mounted && setCustomAlgs(algs || []));
      return () => mounted = false;
    },
    [match]
  );

  return [
    React.useCallback(
      vars => {
        const {
          location: {
            state: {
              algorithm,
              algorithms
            } = {}
          }
        } = match;
        vars.algorithm = algorithm;
        vars.algorithms = algorithms;
        vars.customAlgorithms = customAlgs;
        vars.includeGenes = allGenes;
        return vars;
      },
      [match, customAlgs, allGenes]
    ),
    /* isPending = */!customAlgs
  ];
}
