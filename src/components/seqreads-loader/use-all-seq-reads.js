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

export default function useAllSeqReads({
  defaultParams
}) {
  let {
    strain,
    maxMixturePcnt,
    minPrevalence,
    minCodonReads,
    minPositionReads
  } = defaultParams;
  const {match} = useRouter();
  let {
    location: {
      query: {
        mixpcnt: mixPcnt,
        cutoff,
        cdreads,
        posreads
      } = {}
    } = {}
  } = match;
  mixPcnt = parseFloat(mixPcnt);
  if (!isNaN(mixPcnt)) {
    maxMixturePcnt = mixPcnt;
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
  const [allOrigSeqReads, isPending] = useAllOrigSeqReads(match);
  return useAddParams({
    params: {
      strain,
      maxMixturePcnt,
      minPrevalence,
      minCodonReads,
      minPositionReads
    },
    allSequenceReads: allOrigSeqReads,
    skip: isPending
  });
}
