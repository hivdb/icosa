import React from 'react';
import {v4 as uuidv4} from 'uuid';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import ConfigContext from '../../utils/config-context';

import {
  sanitizeMutations
} from '../../utils/mutation';


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
        0, patterns.findIndex(({name: patN}) => patN === name)
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

  let {patterns} = loc.state || {patterns: []};
  let {name, mutations} = loc.query || {};
  if (!isConfigPending && mutations) {
    mutations = mutations
      .split(/\s*[,+]\s*/g)
      .filter(mut => mut);
    [mutations] = sanitizeMutations(mutations, config, true);
    if (!name) {
      name = mutations.join('+');
    }
    patterns = [{
      uuid: uuidv4(),
      name,
      mutations
    }];
  }
  return patterns;
}


function PatternLoader({
  children,
  childProps = {},
  lazyLoad
}) {
  const patterns = usePatterns();
  const currentSelected = useCurrentSelected({
    lazyLoad, patterns
  });

  return children({
    ...childProps,
    patterns,
    currentSelected
  });
}

PatternLoader.propTypes = {
  children: PropTypes.func.isRequired,
  childProps: PropTypes.object,
  lazyLoad: PropTypes.bool.isRequired
};

export default PatternLoader;
