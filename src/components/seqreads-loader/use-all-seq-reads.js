import React from 'react';
import {useRouter} from 'found';

import BigData from '../../utils/big-data';


function useAllOrigSeqReads(match) {
  const {
    location: {
      state: {
        allSequenceReads: key
      } = {}
    } = {}
  } = match;
  return BigData.use(key);
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
