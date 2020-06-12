import BigData from './big-data';

// no limit
const PRINT_LIMIT = 0;

export function getSeqReadsFromHash(hash, allSeqReads) {
  if (allSeqReads.length === 0) {
    return;
  }
  hash = (hash || '').replace('#', '').trim();
  if (hash === '') {
    return allSeqReads[0];
  }
  for (const seqReads of allSeqReads) {
    if (seqReads.name === hash) {
      return seqReads;
    }
  }
  return allSeqReads[0];
}

export async function getAllSeqReadsFromLocation(location) {
  let allSeqReads = [];
  if (location.state && location.state.allSequenceReads) {
    allSeqReads = await BigData.load(location.state.allSequenceReads);
  }
  return allSeqReads;
}

export async function prepareSeqReadsParams(params, {location}) {
  let allSequenceReads = await getAllSeqReadsFromLocation(location);
  const {query} = location;
  let output, cutoff, rd;
  if (query !== null) {
    output = query.output;
    cutoff = query.cutoff;
    rd = query.rd;
  }
  if (PRINT_LIMIT > 0) {
    allSequenceReads = allSequenceReads.slice(0, PRINT_LIMIT);
  }
  if (output !== 'printable') {
    allSequenceReads = [getSeqReadsFromHash(location.hash, allSequenceReads)];
  }
  let minPrevalence = parseFloat(cutoff);
  minPrevalence = isNaN(minPrevalence) ? -1 : minPrevalence;
  let minReadDepth = parseInt(rd, 10);
  allSequenceReads = allSequenceReads.map(asr => {
    asr.minPrevalence = minPrevalence;
    asr.minReadDepth = minReadDepth;
    return asr;
  });
  return {...params, allSequenceReads};
}
