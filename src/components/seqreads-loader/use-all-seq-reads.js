import React from 'react';
import {useRouter} from 'found';

import BigData from '../../utils/big-data';
import useSmartAsync from '../../utils/use-smart-async';


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

export default function useAllSeqReads({
  defaultParams
}) {
  let {
    strain,
    minPrevalence,
    minCodonReads,
    minPositionReads
  } = defaultParams;
  const {match} = useRouter();
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
