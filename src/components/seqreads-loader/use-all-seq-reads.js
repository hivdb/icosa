import {useRouter} from 'found';

import BigData from '../../utils/big-data';
import useAddParams from './use-add-params';


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

export default function useAllSeqReads({defaultParams}) {
  const {match} = useRouter();
  const [allOrigSeqReads, isPending] = useAllOrigSeqReads(match);
  return useAddParams({
    defaultParams,
    allSequenceReads: allOrigSeqReads,
    skip: isPending
  });
}
