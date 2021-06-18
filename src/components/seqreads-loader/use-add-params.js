import React from 'react';


export default function useAddParams({
  allSequenceReads,
  params,
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
            ...params
          })),
          false
        ];
      }
    },
    [allSequenceReads, params, skip]
  );
}
