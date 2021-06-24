import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';
import difference from 'lodash/difference';


const FILENAME_DELIMITERS = [' ', '_', '-'];
const PAIRED_FASTQ_MARKER = ['1', '2'];
const INVALID_PAIRED_FASTQ_MARKER = /[1-9]0*[12]|[^0]00+[12]|[12]\d/;


function getShortLen(text1, text2) {
  const text1Len = text1.length;
  const text2Len = text2.length;
  return text1Len < text2Len ? text1Len : text2Len;
}


function findPairedMarker(text1, text2) {
  let diffcount = 0;
  let diffpos = -1;
  const shortLen = getShortLen(text1, text2);
  if (
    INVALID_PAIRED_FASTQ_MARKER.test(text1) ||
    INVALID_PAIRED_FASTQ_MARKER.test(text2)
  ) {
    return -1;
  }
  for (let pos = 0; pos < shortLen; pos ++) {
    const a = text1[pos];
    const b = text2[pos];
    if (diffcount > 1) {
      return -1;
    }
    if (a === b) {
      continue;
    }
    if (
      !PAIRED_FASTQ_MARKER.includes(a) ||
      !PAIRED_FASTQ_MARKER.includes(b)
    ) {
      return -1;
    }
    diffcount ++;
    diffpos = pos;
  }
  return diffpos;
}


function* pairingFiles(filenames) {
  const filenamesLen = filenames.length;
  for (let i = 0; i < filenamesLen; i ++) {
    const fn1 = filenames[i];
    for (let j = i + 1; j < filenamesLen; j ++) {
      const fn2 = filenames[j];
      yield [fn1, fn2];
    }
  }
}


function suggestPairName({
  pair: [{name: fileName}],
  pattern: {
    delimiter,
    diffOffset,
    reverse
  }
}) {
  let pairName = fileName.split(/\.fastq(?:\.gz)?/i)[0];
  if (reverse === -1) {
    // single strand
    return pairName;
  }
  pairName = pairName.split(delimiter);
  if (reverse) {
    pairName.reverse();
  }
  pairName.splice(diffOffset, 1);
  if (reverse) {
    pairName.reverse();
  }
  return pairName.join(delimiter);
}


function removeFileUsingRef(
  allPairs,
  index,
  fileName
) {
  const pairProps = allPairs[index];
  if (pairProps.n === 1) {
    allPairs.splice(index, 1);
  }
  else {
    const newPairProps = {
      pair: [
        ...pairProps.pair.filter(f => f.name !== fileName),
        null
      ],
      pattern: {
        delimiter: null,
        diffOffset: -1,
        posPairedMarker: -1,
        reverse: -1
      },
      n: 1
    };
    newPairProps.name = suggestPairName(newPairProps);
    allPairs[index] = newPairProps;
  }
}


export function moveFile(
  allPairs,
  {index: srcIndex, fileName: srcFileName},
  {index: targetIndex}
) {
  allPairs = [...allPairs];
  const srcPair = allPairs[srcIndex];
  const targetPair = {
    ...allPairs[targetIndex]
  };
  if (targetPair.n === 2) {
    throw new Error('Target group is already paired.');
  }
  targetPair.pair = orderBy([
    targetPair.pair[0],
    srcPair.pair.find(f => f.name === srcFileName)
  ], ['name']);
  for (const pattern of findPatterns(...targetPair.pair)) {
    targetPair.pattern = pattern;
    break;
  }
  targetPair.n = 2;
  targetPair.name = suggestPairName(targetPair);
  allPairs[targetIndex] = targetPair;

  removeFileUsingRef(allPairs, srcIndex, srcFileName);
  return allPairs;
}


export function removeFile(
  allPairs,
  index,
  fileName
) {
  allPairs = [...allPairs];
  removeFileUsingRef(allPairs, index, fileName);
  return allPairs;
}


export function splicePair(
  allPairs,
  idx
) {
  allPairs = [...allPairs];
  const {pair: [f1, f2]} = allPairs[idx];
  const p1 = {
    pair: [f1, null],
    pattern: {
      delimiter: null,
      diffOffset: -1,
      posPairedMarker: -1,
      reverse: -1
    },
    n: 1
  };
  p1.name = suggestPairName(p1);
  const p2 = {
    pair: [f2, null],
    pattern: {
      delimiter: null,
      diffOffset: -1,
      posPairedMarker: -1,
      reverse: -1
    },
    n: 1
  };
  p2.name = suggestPairName(p2);
  allPairs.splice(idx, 1, p1, p2);
  return allPairs;
}


function* findPatterns(f1, f2) {
  const fn1 = f1.name;
  const fn2 = f2.name;
  if (fn1.length !== fn2.length) {
    return;
  }
  for (const delimiter of FILENAME_DELIMITERS) {
    if (!fn1.includes(delimiter) || !fn2.includes(delimiter)) {
      continue;
    }
    const chunks1 = fn1.split(delimiter);
    const chunks2 = fn2.split(delimiter);
    if (chunks1.length !== chunks2.length) {
      continue;
    }
    for (let reverse = 1; reverse > -1; reverse --) {
      let diffcount = 0;
      let invalid = false;
      let diffOffset = -1;
      let posPairedMarker = -1;
      if (reverse === 1) {
        chunks1.reverse();
        chunks2.reverse();
      }
      for (let n = 0; n < chunks1.length; n ++) {
        const left = chunks1[n];
        const right = chunks2[n];
        if (diffcount > 1) {
          invalid = true;
          break;
        }
        if (left === right) {
          continue;
        }
        posPairedMarker = findPairedMarker(left, right);
        if (posPairedMarker < 0) {
          invalid = true;
          break;
        }
        diffOffset = n;
        diffcount ++;
      }
      if (!invalid) {
        yield {
          delimiter,
          diffOffset,
          posPairedMarker,
          reverse
        };
      }
    }
  }
}

/**
 * Smartly identify paired FASTQ files
 *
 * A valid filename pattern must meet:
 * - use one of the valid delimiters (" ", "_" or "-") to separate the filename
 *   into different chunks
 * - in one and only one chunk, a fixed position character changed from "1" to
 *   "2"
 *
 * Valid pair pattern examples:
 *   14258F_L001_R1_001.fastq.gz <-> 14258F_L001_R2_001.fastq.gz
 *   SampleExample_1.fastq <-> SampleExample_2.fastq
 *
 * Invalid pair pattern examples:
 *   SampleExample1.fastq <-> SampleExample2.fastq
 *   SampleExample_1.fastq <-> SampleExample_2.fastq.gz
 *   SampleExample_1.FASTQ.GZ <-> SampleExample_2.fastq.gz
 */
export function* identifyPairs(files) {
  const filenames = files.map(({name}) => name);
  const patterns = {};
  for (const [f1, f2] of pairingFiles(files)) {
    for (const {
      delimiter,
      diffOffset,
      posPairedMarker,
      reverse
    } of findPatterns(f1, f2)) {
      const key = `${
        delimiter
      }$${
        diffOffset
      }$${
        posPairedMarker
      }$${
        reverse
      }`;
      patterns[key] = patterns[key] || {
        delimiter,
        diffOffset,
        posPairedMarker,
        reverse,
        pairs: []
      };
      patterns[key].pairs.push(orderBy([f1, f2], ['name']));
    }
  }
  let covered = [];
  const orderedPatterns = orderBy(
    Object.values(patterns),
    [({pairs}) => pairs.length, 'reverse'],
    ['desc', 'desc']
  );
  for (const {pairs, ...pattern} of orderedPatterns) {
    const known = [];
    let invalid = false;
    for (const [left, right] of pairs) {
      if (covered.includes(left) || covered.includes(right)) {
        // a pattern is invalid if the pairs is already matched
        // by a previous pattern
        invalid = true;
        break;
      }

      if (known.includes(left) || known.includes(right)) {
        // a pattern is invalid if there's duplicate in pairs
        invalid = true;
        break;
      }
      known.push(left);
      known.push(right);
    }

    if (!invalid) {
      covered = [...covered, ...known];
      for (const pair of pairs) {
        yield {
          name: suggestPairName({pair, pattern}),
          pair,
          pattern,
          n: 2
        };
      }
    }
  }
  let coveredArr = uniq(covered);
  if (filenames.length > coveredArr.length) {
    const remains = orderBy(difference(files, coveredArr), ['name']);
    for (const left of remains) {
      const pair = [left, null];
      const pattern = {
        delimiter: null,
        diffOffset: -1,
        posPairedMarker: -1,
        reverse: -1
      };
      yield {
        name: suggestPairName({pair, pattern}),
        pair,
        pattern,
        n: 1
      };
    }
  }
}
