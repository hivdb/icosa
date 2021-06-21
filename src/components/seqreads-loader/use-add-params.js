import React from 'react';


export default function useAddParams({
  allSequenceReads,
  params: {
    strain,
    maxMixtureRate,
    minPrevalence,
    minCodonReads,
    minPositionReads
  },
  skip
}) {
  // useMemo to ensure the returning array uses the same ref
  return React.useMemo(
    () => {
      if (skip) {
        return [undefined, true];
      }
      else {
        return [
          allSequenceReads.map(sr => ({
            ...sr,  // deep-copy to avoid cache
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
