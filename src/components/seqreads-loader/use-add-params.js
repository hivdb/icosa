import React from 'react';
import {useRouter} from 'found';


export default function useAddParams({
  allSequenceReads,
  defaultParams: {
    strain,
    maxMixtureRate,
    minPrevalence,
    minCodonReads,
    minPositionReads
  },
  skip
}) {
  const {match} = useRouter();
  let {
    location: {
      query: {
        mixrate: mixRate,
        cutoff,
        cdreads,
        posreads
      } = {}
    } = {}
  } = match;
  mixRate = parseFloat(mixRate);
  if (!isNaN(mixRate)) {
    maxMixtureRate = mixRate;
  }
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

  // useMemo to ensure the returning array uses the same ref
  return React.useMemo(
    () => {
      if (skip) {
        return [undefined, true];
      }
      else {
        return [
          allSequenceReads.map(sr => ({
            ...sr, // deep-copy to avoid cache
            strain,
            maxMixtureRate,
            minPrevalence,
            minCodonReads,
            minPositionReads
          })),
          false
        ];
      }
    },
    [
      allSequenceReads,
      strain,
      maxMixtureRate,
      minPrevalence,
      minCodonReads,
      minPositionReads,
      skip
    ]
  );
}
