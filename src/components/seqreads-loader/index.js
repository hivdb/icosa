import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, withRouter} from 'found';

import config from '../../config';
import BigData from '../../utils/big-data';
import PromiseComponent from '../../utils/promise-component';


const SEQ_READS_CACHE = {};
const DEFAULT_CUTOFF = config.seqReadsDefaultCutoff;


function getCurrentSelected({
  match: {location = {query: {}}},
  lazyLoad,
  allSequenceReads
}) {
  if (!lazyLoad) { return undefined; }
  const {query: {name}} = location;
  if (!name) {
    return {index: 0, name: allSequenceReads[0].name};
  }
  const index = Math.max(
    0, allSequenceReads.findIndex(({name: seqH}) => seqH === name)
  );
  return {index, name: allSequenceReads[index].name};
}


async function prepareChildProps(props) {
  let {
    match, lazyLoad,
    match: {location: loc},
    childProps = {}
  } = props;
  /* if (onLoadCache && loc.query && 'load' in loc.query) {
    const cachedData = await onLoadCache(loc.query.load);
    allSequenceReads = cachedData.allSequenceReads;
    cachedProps = cachedData.props;
  } */

  const key = loc.state.allSequenceReads;
  if (!key) {
    console.error(
      "There's not location.state.allSequenceReads for current view."
    );
  }
  let allSequenceReads;
  if (key in SEQ_READS_CACHE) {
    allSequenceReads = SEQ_READS_CACHE[key];
  }
  else {
    allSequenceReads = await BigData.load(key);
    SEQ_READS_CACHE[key] = allSequenceReads;
  }
  
  // attach query parameters
  const {
    query: {cutoff, rd} = {}
  } = loc;
  let minPrevalence = parseFloat(cutoff);
  minPrevalence = isNaN(minPrevalence) ? DEFAULT_CUTOFF : minPrevalence;
  let minPositionReads = parseInt(rd, 10);
  minPositionReads = isNaN(minPositionReads) ? undefined : minPositionReads;
  allSequenceReads = allSequenceReads.map(sr => {
    sr = {...sr};  // deep-copy to avoid cache
    sr.minPrevalence = minPrevalence;
    sr.minPositionReads = minPositionReads;
    return sr;
  });

  childProps = {
    ...childProps,
    allSequenceReads,
    currentSelected: getCurrentSelected({
      match, lazyLoad, allSequenceReads
    })
  };
  
  return childProps;
}


function BaseSeqReadsLoader(props) {

  const {children} = props;

  const promise = prepareChildProps(props);
  return (
    <PromiseComponent
     promise={promise}
     then={children} />
  );
}

BaseSeqReadsLoader.propTypes = {
  match: matchShape.isRequired,
  children: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired
};

export default withRouter(BaseSeqReadsLoader);
