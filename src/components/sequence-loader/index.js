import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, withRouter} from 'found';

import BigData from '../../utils/big-data';
import PromiseComponent from '../../utils/promise-component';


function getCurrentSelected({
  match: {location = {query: {}}},
  lazyLoad,
  sequences
}) {
  if (!lazyLoad) { return sequences[0]; }
  const {query: {header}} = location;
  if (!header) {
    return {index: 0, header: sequences[0].header};
  }
  const index = Math.max(
    0, sequences.findIndex(({header: seqH}) => seqH === header)
  );
  return {index, header: sequences[index].header};
}


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
