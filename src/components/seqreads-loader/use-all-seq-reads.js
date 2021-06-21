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
    maxMixtureRate,
    minPrevalence,
    minCodonReads,
    minPositionReads
  } = defaultParams;
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
  const [allOrigSeqReads, isPending] = useAllOrigSeqReads(match);
  return useAddParams({
    params: {
      strain,
      maxMixtureRate,
      minPrevalence,
      minCodonReads,
      minPositionReads
    },
    allSequenceReads: allOrigSeqReads,
    skip: isPending
  });
}
