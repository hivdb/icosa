import React from 'react';
import {useRouter} from 'found';

import BigData, {isBigData} from '../../utils/big-data';
import useAddParams from './use-add-params';

export function useWhenNoSeqReads(callback: () => void) {
  const {
    match: {
      location: {
        state: {
          allSequenceReads: key
        } = {},
      } = {},
    },
  } = useRouter() as any;
  if (!isBigData(key)) {
    callback();
  }
}

export default function useAllSeqReads({defaultParams}: {defaultParams: any}) {
  const {
    match: {
      location: {
        state: {
          allSequenceReads: key
        } = {},
      } = {},
    },
  } = useRouter() as any;
  let allOrigSeqReads: any[] = [];
  let isPending = true;
  try {
    [allOrigSeqReads, isPending] = BigData.use(key);
  }
  catch (Error) {
    // skip
  }
  return useAddParams({
    defaultParams,
    allSequenceReads: allOrigSeqReads,
    skip: isPending
  });
}
