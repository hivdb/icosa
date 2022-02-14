import {useRouter} from 'found';

import BigData, {isBigData} from '../../utils/big-data';
import useAddParams from './use-add-params';


export function useWhenNoSeqReads(callback) {
  const {
    match: {
      location: {
        state: {
          allSequenceReads: key
        } = {}
      } = {}
    }
  } = useRouter();
  if (!isBigData(key)) {
    callback();
  }
}

export default function useAllSeqReads({defaultParams}) {
  const {
    match: {
      location: {
        state: {
          allSequenceReads: key
        } = {}
      } = {}
    }
  } = useRouter();
  let allOrigSeqReads = [];
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
