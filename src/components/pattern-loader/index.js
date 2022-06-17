import React from 'react';
import {v5 as uuidv5} from 'uuid';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import ConfigContext from '../../utils/config-context';

import {
  sanitizeMutations
} from '../../utils/mutation';

const UUID_NAMESPACE = '14ee7f0c-7b10-425e-a4b1-b9f0a03ab5a9';


function useCurrentSelected({
  lazyLoad,
  patterns
}) {
  const {
    match: {location = {query: {}}}
  } = useRouter();

  return React.useMemo(
    () => {
      if (!patterns || patterns.length === 0) { return {}; }
      if (!lazyLoad) { return patterns[0]; }

      const name = location.query.name;
      if (!name) {
        return {index: 0, name: patterns[0].name};
      }
      const index = Math.max(
        0,
        patterns.findIndex(({name: patN}) => patN === name)
      );
      return {index, name: patterns[index].name};
    },
    [lazyLoad, patterns, location.query.name]
  );
}


function usePatterns() {
  const {
    match: {location: loc}
  } = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const statePatterns = JSON.stringify(loc.state?.patterns || []);
  const {name: queryName, mutations: queryMuts} = loc.query || {};

  const {
    defaultGene,
    geneSynonyms,
    geneReferences,
    messages
  } = config || {};

  const patterns = React.useMemo(
    () => {
      let patterns = JSON.parse(statePatterns);
      if (!isConfigPending && queryMuts) {
        let name = queryName;
        let mutations = queryMuts
          .split(/\s*[,+]\s*/g)
          .filter(mut => mut);
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
  return [patterns, isConfigPending];
}


function PatternLoader({
  children,
  childProps = {},
  lazyLoad
}) {
  const [patterns, isPending] = usePatterns();
  const currentSelected = useCurrentSelected({
    lazyLoad, patterns
  });

  return children({
    ...childProps,
    patterns,
    isPending,
    currentSelected
  });
}

PatternLoader.propTypes = {
  children: PropTypes.func.isRequired,
  childProps: PropTypes.object,
  lazyLoad: PropTypes.bool.isRequired
};

export default PatternLoader;
