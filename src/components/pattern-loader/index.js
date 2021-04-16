import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';


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

  const {patterns} = loc.state;
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
