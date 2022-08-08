import React from 'react';
import {useRouter} from 'found';
import BigData from '../../utils/big-data';

const SUBMIT_STATE_ALLOWLIST = ['algorithm', 'algorithms', 'customAlgorithms'];


export default function useExtendVariables({
  getSubmitState,
  config
}) {
  const {allGenes} = config;
  const [extendVars, setExtendVars] = React.useState(null);
  const {match} = useRouter();

  React.useEffect(
    () => {
      let mounted = true;
      setExtendVars(null);
      (async () => {
        const submitState = (
          getSubmitState ?
            await getSubmitState() :
            match.location?.state
        );
        const {customAlgorithms} = submitState;
        if (mounted) {
          if (customAlgorithms) {
            setExtendVars({
              ...submitState,
              customAlgorithms: (await BigData.load(customAlgorithms)) || []
            });
          }
          else {
            setExtendVars(submitState);
          }
        }
      })();
      return () => mounted = false;
    },
    [match.location?.state, getSubmitState]
  );

  return [
    React.useCallback(
      vars => {
        for (const key of SUBMIT_STATE_ALLOWLIST) {
          if (key in extendVars) {
            vars[key] = extendVars[key];
          }
        }
        vars.includeGenes = allGenes;
        return vars;
      },
      [extendVars, allGenes]
    ),
    /* isPending = */!extendVars
  ];
}
