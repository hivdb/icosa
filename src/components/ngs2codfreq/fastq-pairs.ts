import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';
import difference from 'lodash/difference';


// Utility constants used to infer FASTQ file pairings based on file names.
const FILENAME_DELIMITERS = [' ', '_', '-'];
const PAIRED_FASTQ_MARKER = ['1', '2'];
const INVALID_PAIRED_FASTQ_MARKER = /[1-9]0*[12]|[^0]00+[12]|[12]\d/;

/** Description of a filename pattern used to detect pairing. */
export interface PairPattern {
  delimiter: string | null;
  diffOffset: number;
  posPairedMarker: number;
  reverse: number;
}

/**
 * A FASTQ pair entry. `pair` contains the two files; one may be `null` for
 * single-end reads. `n` indicates how many files are present (1 or 2).
 */
export interface FastqPair {
  name: string;
  pair: [File | null, File | null];
  pattern: PairPattern;
  n: number;
}


function getShortLen(text1: string, text2: string): number {
  const text1Len = text1.length;
  const text2Len = text2.length;
  return text1Len < text2Len ? text1Len : text2Len;
}


function findPairedMarker(text1: string, text2: string): number {
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


function* pairingFiles<T>(filenames: T[]): Generator<[T, T], void, unknown> {
  const filenamesLen = filenames.length;
  for (let i = 0; i < filenamesLen; i ++) {
    const fn1 = filenames[i];
    for (let j = i + 1; j < filenamesLen; j ++) {
      const fn2 = filenames[j];
      yield [fn1, fn2];
    }
  }
}


/**
 * Infer the common prefix name for a FASTQ pair using the detected pattern.
 *
 * When only a single file is present, the file name (without extension) is
 * returned directly. The function gracefully handles `null` entries within the
 * pair.
 *
 * @param pair - FASTQ files in the pair.
 * @param pattern - Pattern information describing how the pair was matched.
 * @returns Suggested name for the pair.
 */
function suggestPairName({
  pair: [file],
  pattern: { delimiter, diffOffset, reverse }
}: FastqPair): string {
  const fileName = file?.name ?? '';
  let pairName = fileName.split(/\.fastq(?:\.gz)?/i)[0];
  if (reverse === -1 || !delimiter) {
    // Single-end reads or missing delimiter; return raw name
    return pairName;
  }
  let chunks = pairName.split(delimiter);
  if (reverse) {
    chunks = chunks.reverse();
  }
  chunks.splice(diffOffset, 1);
  if (reverse) {
    chunks = chunks.reverse();
  }
  return chunks.join(delimiter);
}


/**
 * Remove a file from the pair at a given index.
 *
 * @param allPairs - Mutable list of all FASTQ pairs.
 * @param index - Index of the pair to update.
 * @param fileName - Name of the file to remove.
 */
function removeFileUsingRef(
  allPairs: FastqPair[],
  index: number,
  fileName: string
): void {
  const pairProps = allPairs[index];
  if (pairProps.n === 1) {
    allPairs.splice(index, 1);
  }
  else {
    const remaining = pairProps.pair.find(
      f => f && f.name !== fileName
    ) ?? null;
    const newPairProps: FastqPair = {
      pair: [remaining, null],
      pattern: {
        delimiter: null,
        diffOffset: -1,
        posPairedMarker: -1,
        reverse: -1
      },
      n: 1,
      name: ''
    };
    newPairProps.name = suggestPairName(newPairProps);
    allPairs[index] = newPairProps;
  }
}


/**
 * Move a file from one pair to another.
 * @param allPairs - existing FASTQ pairs.
 * @param src - source pair index and file name.
 * @param target - target pair index.
 * @returns new array of pairs with the file relocated.
 */
export function moveFile(
  allPairs: FastqPair[],
  {index: srcIndex, fileName: srcFileName}: {index: number; fileName: string},
  {index: targetIndex}: {index: number}
): FastqPair[] {
  allPairs = [...allPairs];
  const srcPair = allPairs[srcIndex];
  const targetPair: FastqPair = {
    ...allPairs[targetIndex]
  };
  if (targetPair.n === 2) {
    throw new Error('Target group is already paired.');
  }
  const srcFile = srcPair.pair.find(f => f && f.name === srcFileName) ?? null;
  targetPair.pair = orderBy([
    targetPair.pair[0],
    srcFile
  ], ['name']) as [File | null, File | null];
  if (targetPair.pair[0] && targetPair.pair[1]) {
    for (const pattern of findPatterns(targetPair.pair[0], targetPair.pair[1])) {
      targetPair.pattern = pattern;
      break;
    }
  }
  targetPair.n = 2;
  targetPair.name = suggestPairName(targetPair);
  allPairs[targetIndex] = targetPair;

  removeFileUsingRef(allPairs, srcIndex, srcFileName);
  return allPairs;
}


/**
 * Remove a file from a pair.
 * @param allPairs - existing FASTQ pairs.
 * @param index - index of the pair containing the file.
 * @param fileName - name of the file to remove.
 */
export function removeFile(
  allPairs: FastqPair[],
  index: number,
  fileName: string
): FastqPair[] {
  allPairs = [...allPairs];
  removeFileUsingRef(allPairs, index, fileName);
  return allPairs;
}


/**
 * Split a paired entry into two single entries.
 * @param allPairs - existing FASTQ pairs.
 * @param idx - index of the pair to split.
 */
export function splicePair(
  allPairs: FastqPair[],
  idx: number
): FastqPair[] {
  allPairs = [...allPairs];
  const {pair: [f1, f2]} = allPairs[idx];
  const p1: FastqPair = {
    pair: [f1, null],
    pattern: {
      delimiter: null,
      diffOffset: -1,
      posPairedMarker: -1,
      reverse: -1
    },
    n: 1,
    name: ''
  } as FastqPair;
  p1.name = suggestPairName(p1);
  const p2: FastqPair = {
    pair: [f2, null],
    pattern: {
      delimiter: null,
      diffOffset: -1,
      posPairedMarker: -1,
      reverse: -1
    },
    n: 1,
    name: ''
  } as FastqPair;
  p2.name = suggestPairName(p2);
  allPairs.splice(idx, 1, p1, p2);
  return allPairs;
}


function* findPatterns(f1: File, f2: File): Generator<PairPattern, void, unknown> {
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
/**
 * Identify pairs of FASTQ files based on their file names.
 * @param files - list of uploaded files.
 * @yields FastqPair objects describing detected pairs or singletons.
 */
export function* identifyPairs(files: File[]): Generator<FastqPair, void, unknown> {
  const filenames = files.map(({name}) => name);
  const patterns: Record<string, {delimiter: string; diffOffset: number; posPairedMarker: number; reverse: number; pairs: File[][];}> = {};
  for (const [f1, f2] of pairingFiles(files)) {
    for (const { delimiter, diffOffset, posPairedMarker, reverse } of findPatterns(f1, f2)) {
      const key = `${delimiter}$${diffOffset}$${posPairedMarker}$${reverse}`;
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
  let covered: File[] = [];
  const orderedPatterns = orderBy(
    Object.values(patterns),
    [({pairs}) => pairs.length, 'reverse'],
    ['desc', 'desc']
  );
  for (const {pairs, ...pattern} of orderedPatterns) {
    const known: File[] = [];
    let invalid = false;
    for (const [left, right] of pairs) {
      if (covered.includes(left) || covered.includes(right)) {
        invalid = true;
        break;
      }

      if (known.includes(left) || known.includes(right)) {
        invalid = true;
        break;
      }
      known.push(left);
      known.push(right);
    }

    if (!invalid) {
      covered = [...covered, ...known];
      for (const pair of pairs) {
        const fastqPair: FastqPair = {
          name: '',
          pair: pair as [File, File],
          pattern,
          n: 2
        };
        fastqPair.name = suggestPairName(fastqPair);
        yield fastqPair;
      }
    }
  }
  const coveredArr = uniq(covered);
  if (filenames.length > coveredArr.length) {
    const remains = orderBy(difference(files, coveredArr), ['name']);
    for (const left of remains) {
      const pair: [File, null] = [left, null];
      const pattern: PairPattern = {
        delimiter: null,
        diffOffset: -1,
        posPairedMarker: -1,
        reverse: -1
      };
      const fastqPair: FastqPair = {
        name: '',
        pair,
        pattern,
        n: 1
      };
      fastqPair.name = suggestPairName(fastqPair);
      yield fastqPair;
    }
  }
}
