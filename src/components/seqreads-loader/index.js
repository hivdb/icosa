import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import FixedLoader from '../fixed-loader';
import BigData from '../../utils/big-data';
import useSmartAsync from '../../utils/use-smart-async';

import {ConfigContext} from '../report';


function getCurrentSelected({
  match: {location = {query: {}}},
  lazyLoad,
  allSequenceReads
}) {
  if (!lazyLoad) { return {}; }
  if (allSequenceReads.length === 0) { return {}; }

  const {query: {name}} = location;
  if (!name) {
    return {index: 0, name: allSequenceReads[0].name};
  }
  const index = Math.max(
    0, allSequenceReads.findIndex(({name: seqH}) => seqH === name)
  );
  return {index, name: allSequenceReads[index].name};
}


function useAllOrigSeqReads(match) {
  const {
    location: {
      state: {
        allSequenceReads: key
      } = {}
    } = {}
  } = match;
  if (!key) {
    throw new Error(
      "There's not location.state.allSequenceReads for current view."
    );
  }
  const {data, error, isPending} = useSmartAsync({
    promiseFn: BigData.load,
    key
  });
  if (error) {
    throw new Error(error.message);
  }
  else if (!isPending && !(data instanceof Array)) {
    throw new Error(
      `The stored allSequenceReads is not an array: ${JSON.stringify(data)}`
    );
  }
  return [data, isPending];
}

function useAllSeqReads({
  match,
  defaultParams
}) {
  let {
    strain,
    minPrevalence,
    minCodonReads,
    minPositionReads
  } = defaultParams;
  let {
    location: {
      query: {
        cutoff,
        cdreads,
        posreads
      } = {}
    } = {}
  } = match;
  cutoff = parseFloat(cutoff);
  if (!isNaN(cutoff)) {
    minPrevalence = cutoff;
  }
  cdreads = parseInt(cdreads, 10);
  if (!isNaN(cdreads)) {
    minCodonReads = cdreads;
  }
  posreads = parseInt(posreads, 10);
  if (!isNaN(posreads)) {
    minPositionReads = posreads;
  }
  const [allOrigSeqReads, isPending] = useAllOrigSeqReads(match);
  // useMemo to ensure the returning array uses the same ref
  return React.useMemo(
    () => {
      if (isPending) {
        return [undefined, true];
      }
      else {
        return [
          allOrigSeqReads.map(sr => ({
            ...sr,  // deep-copy to avoid cache
            strain,
            minPrevalence,
            minCodonReads,
            minPositionReads
          })),
          false
        ];
      }
    },
    [
      strain,
      minPrevalence,
      minCodonReads,
      minPositionReads,
      allOrigSeqReads,
      isPending
    ]
  );
}


function SeqReadsLoader(props) {
  const {
    match,
    lazyLoad,
    defaultParams,
    childProps = {},
    children
  } = props;
  const [allSequenceReads, isPending] = useAllSeqReads({
    match,
    defaultParams
  });
  if (isPending) {
    return <FixedLoader />;
  }
  else {
    return children({
      ...childProps,
      allSequenceReads,
      currentSelected: getCurrentSelected({
        match, lazyLoad, allSequenceReads
      })
    });
  }
}


function SeqReadsLoaderWrapper(props) {

  const {match} = useRouter();
  const [config, isPending] = ConfigContext.use();

  if (isPending) {
    return <FixedLoader />;
  }

  const {seqReadsDefaultParams: defaultParams} = config;

  return (
    <SeqReadsLoader
     {...props}
     {...{match, defaultParams}} />
  );
}

SeqReadsLoaderWrapper.propTypes = {
  children: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired
};

export default SeqReadsLoaderWrapper;
