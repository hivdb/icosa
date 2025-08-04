import React from 'react';
import React from 'react';
import { useRouter } from 'found';
import BigData from '../../utils/big-data';

const SUBMIT_STATE_ALLOWLIST = ['algorithm', 'algorithms', 'customAlgorithms'];


interface UseExtendVariablesArgs {
  /** Optional function for obtaining the submit state */
  getSubmitState?: () => Promise<Record<string, any>>;
  /** Runtime configuration object */
  config: { allGenes: string[] };
}

/**
 * Extend variables supplied to GraphQL queries with additional state derived
 * from the current router location or a custom submit-state handler.
 *
 * @param args - {@link UseExtendVariablesArgs}
 * @returns A tuple containing the extender function and pending state.
 */
export default function useExtendVariables({
  getSubmitState,
  config
}: UseExtendVariablesArgs): [(vars: Record<string, any>) => Record<string, any>, boolean] {
  const {allGenes} = config;
  const [extendVars, setExtendVars] = React.useState<Record<string, any> | null>(null);
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
        ) || {};
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
      (vars: Record<string, any>) => {
        for (const key of SUBMIT_STATE_ALLOWLIST) {
          if (extendVars && key in extendVars) {
            vars[key] = extendVars[key];
          }
        }
        vars.includeGenes = allGenes;
        return vars;
      },
      [extendVars, allGenes]
    ),
    /* isPending = */ !extendVars
  ];
}
