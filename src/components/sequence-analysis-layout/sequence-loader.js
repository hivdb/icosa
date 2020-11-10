import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, withRouter} from 'found';

import BigData from '../../utils/big-data';
import PromiseComponent from '../../utils/promise-component';

import {getCurrentSelected} from './funcs';


async function prepareChildProps(props) {
  let {
    match, lazyLoad,
    match: {location: loc},
    childProps = {}
  } = props;

  /* if (onLoadCache && loc.query && 'load' in loc.query) {
    const {sequences, props: cachedProps} = await onLoadCache(loc.query.load);
    childProps = {...otherProps, sequences, cachedProps};
  } */

  const key = loc.state.sequences;
  if (!key) {
    console.error("There's not location.state.sequences for current view.");
  }
  let sequences;
  sequences = await BigData.load(key);
  sequences.map(seq => {
    delete seq.size;
    return seq;
  });
  
  childProps = {
    ...childProps,
    sequences,
    currentSelected: getCurrentSelected({
      match, lazyLoad, sequences
    })
  };
  
  return childProps;
}


function BaseSequenceLoader(props) {

  const {children} = props;

  const promise = prepareChildProps(props);
  return (
    <PromiseComponent
     promise={promise}
     then={children} />
  );



}

BaseSequenceLoader.propTypes = {
  match: matchShape.isRequired,
  children: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired
};

export default withRouter(BaseSequenceLoader);
