import React from 'react';
import {useRouter} from 'found';

interface Params {
  strain: string;
  maxMixtureRate: number;
  minPrevalence: number;
  minCodonReads: number;
  minPositionReads: number;
}

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
}: {
  allSequenceReads: any[];
  defaultParams: Params;
  skip: boolean;
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
  } = match as any;
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
        return [undefined, true] as [undefined, boolean];
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
        ] as [any[], boolean];
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
