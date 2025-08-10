import React from 'react';
import {useRouter} from 'found';

import ConfigContext from '../../utils/config-context';

import {
  sanitizeMutations
} from '../../utils/mutation';
import {v5 as uuidv5} from 'uuid';

const UUID_NAMESPACE = '14ee7f0c-7b10-425e-a4b1-b9f0a03ab5a9';

interface Pattern {
  uuid: string;
  name: string;
  mutations: string[];
}

interface CurrentSelected {
  index: number;
  name: string;
}

/**
 * Derive the currently selected pattern based on the router state.
 *
 * @param opts - Contains lazy load flag and available patterns.
 * @returns The selected pattern or an empty object when none is available.
 */
function useCurrentSelected({
  lazyLoad,
  patterns
}: {lazyLoad: boolean; patterns: Pattern[]}): CurrentSelected | Record<string, never> {
  const {
    match: {location = {query: {}}}
  } = useRouter();

  return React.useMemo<CurrentSelected | Record<string, never>>(
    () => {
      if (!patterns || patterns.length === 0) { return {} as Record<string, never>; }
      if (!lazyLoad) { return {index: 0, name: patterns[0].name}; }

      const name = (location as any).query.name;
      if (!name) {
        return {index: 0, name: patterns[0].name};
      }
      const index = Math.max(
        0,
        patterns.findIndex(({name: patN}) => patN === name)
      );
      return {index, name: patterns[index].name};
    },
    [lazyLoad, patterns, (location as any).query.name]
  );
}

function usePatterns() {
  const {
    match: {location: loc}
  } = useRouter();
  const [config, isConfigPending] = ConfigContext.use() as any;

  const statePatterns = JSON.stringify((loc as any).state?.patterns || []);
  const {name: queryName, mutations: queryMuts} = (loc as any).query || {};

  const {
    defaultGene,
    geneSynonyms,
    geneReferences,
    messages
  } = config || {};

  const patterns = React.useMemo<Pattern[]>(
    () => {
      let patterns: Pattern[] = JSON.parse(statePatterns);
      if (!isConfigPending && queryMuts) {
        let name = queryName;
        let mutations = queryMuts
          .split(/\s*[,+]\s*/g)
          .filter((mut: string) => mut);
        [mutations] = sanitizeMutations(mutations, {
          defaultGene,
          geneSynonyms,
          geneReferences,
          messages,
          removeErrors: true
        });
        if (!name) {
          name = mutations.join('+');
        }
        patterns = [{
          uuid: uuidv5(queryMuts, UUID_NAMESPACE),
          name,
          mutations
        }];
      }
      return patterns;
    },
    [
      statePatterns,
      isConfigPending,
      queryMuts,
      queryName,
      defaultGene,
      geneSynonyms,
      geneReferences,
      messages
    ]
  );
  return [patterns, isConfigPending] as [Pattern[], boolean];
}

interface PatternLoaderProps {
  children: (args: {
    patterns: Pattern[];
    isPending: boolean;
    currentSelected: CurrentSelected;
  }) => React.ReactElement;
  childProps?: Record<string, unknown>;
  lazyLoad: boolean;
}

/**
 * Load mutation patterns and pass them to a render prop child.
 */
function PatternLoader({
  children,
  childProps = {},
  lazyLoad
}: PatternLoaderProps) {
  const [patterns, isPending] = usePatterns();
  const currentSelected = useCurrentSelected({
    lazyLoad, patterns
  }) as CurrentSelected;

  return children({
    ...childProps,
    patterns,
    isPending,
    currentSelected
  });
}

export default PatternLoader;
