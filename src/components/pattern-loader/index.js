import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, withRouter} from 'found';

import PromiseComponent from '../../utils/promise-component';


function getCurrentSelected({
  match: {location = {query: {}}},
  lazyLoad,
  patterns
}) {
  if (!lazyLoad) { return undefined; }
  const {query: {name}} = location;
  if (!name) {
    return {index: 0, name: patterns[0].name};
  }
  const index = Math.max(
    0, patterns.findIndex(({name: patN}) => patN === name)
  );
  return {index, name: patterns[index].name};
}


async function prepareChildProps(props) {
  let {
    match, lazyLoad,
    match: {location: loc},
    childProps = {}
  } = props;

  const {patterns} = loc.state;
  
  childProps = {
    ...childProps,
    patterns,
    currentSelected: getCurrentSelected({
      match, lazyLoad, patterns
    })
  };
  
  return childProps;
}


function BasePatternLoader(props) {
  const {children} = props;
  const promise = prepareChildProps(props);
  return (
    <PromiseComponent
     promise={promise}
     then={children} />
  );
}

BasePatternLoader.propTypes = {
  match: matchShape.isRequired,
  children: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired
};

export default withRouter(BasePatternLoader);
