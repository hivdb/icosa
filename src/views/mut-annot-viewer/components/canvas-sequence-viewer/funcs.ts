import uniq from 'lodash/uniq';

import type {Annotation, Position} from '../../prop-types';

/**
 * Convert a list of integers into an array of inclusive ranges.
 *
 * @param numbers - Integers to be grouped.
 * @returns Array of `[start, end]` pairs representing continuous ranges.
 */
export function integersToRange(numbers: number[]): Array<[number, number]> {
  const groups = (numbers
    .sort((a, b) => a - b)
    .reduce<[number, number][]>((acc, num) => {
      if (acc.length === 0) {
        acc.push([num, num]);
        return acc;
      }
      const prevGroup = acc[acc.length - 1];
      const prevNum = prevGroup[1];
      if (prevNum + 1 === num) {
        // continuous
        prevGroup[1] = num;
      }
      else {
        acc.push([num, num]);
      }
      return acc;
    }, [])
  );
  return groups;
}

/**
 * Map annotation definitions to the positions on which they appear.
 *
 * @param posLookup - Lookup table of positions by number.
 * @param displayAnnots - Annotation definitions currently being displayed.
 * @returns Array of annotation objects with their associated positions.
 */
export function getPositionsByAnnot(
  posLookup: Record<number, Position>,
  displayAnnots: Annotation[]
): {annot: Annotation; positions: number[]}[] {
  const results: {annot: Annotation; positions: number[]}[] = [];
  for (const annot of displayAnnots) {
    const {level} = annot;
    const result: {annot: Annotation; positions: number[]} = {annot, positions: []};

    for (const posdata of Object.values(posLookup)) {
      let annotVal: string | null = null;
      if (level === 'position') {
        annotVal = getPosAnnotVal(annot, posdata);
      }
      else if (getPosAnnotAAs(annot, posdata).length > 0) {
        annotVal = 'X';
      }
      if (annotVal === null) {
        continue;
      }
      result.positions.push(posdata.position);
    }
    results.push(result);
  }
  return results;
}

/**
 * Collect additional annotation names that occur at each position.
 *
 * @param posLookup - Lookup table of positions by number.
 * @param displayAnnots - Annotation definitions currently being displayed.
 * @returns Mapping of position to annotation names present at that position.
 */
export function getExtraAnnotNamesByPositions(
  posLookup: Record<number, Position>,
  displayAnnots: Annotation[]
): Record<number, string[]> {
  const results: Record<number, string[]> = {};
  for (const annot of displayAnnots) {
    const {level} = annot;
    if (level === 'position') {
      for (const posdata of Object.values(posLookup)) {
        const pos = posdata.position;
        const annotVal = getPosAnnotVal(annot, posdata);
        if (annotVal === null) {
          continue;
        }
        results[pos] = results[pos] || [];
        results[pos].push(annot.name);
      }
    }
  }
  return results;
}

/**
 * Retrieve the annotation value for a specific position.
 *
 * @param curAnnot - Annotation definition.
 * @param posAnnot - Position data containing annotations.
 * @returns Annotation value or `null` when not found or not applicable.
 */
export function getPosAnnotVal(
  curAnnot: Annotation | undefined,
  posAnnot: Position | undefined
): string | null {
  if (!posAnnot || !curAnnot) {
    return null;
  }
  const {
    name: annotName,
    level
  } = curAnnot;
  if (level === 'aminoAcid') {
    return null;
  }
  for (const {name, value} of posAnnot.annotations) {
    if (name !== annotName) {
      continue;
    }
    return value ?? null;
  }
  return null;
}

/**
 * Retrieve amino acid annotations for a position.
 *
 * @param curAnnot - Annotation definition.
 * @param posAnnot - Position data containing annotations.
 * @returns Array of amino acid strings, or an empty array when none.
 */
export function getPosAnnotAAs(
  curAnnot: Annotation | undefined,
  posAnnot: Position | undefined
): string[] {
  if (!posAnnot || !curAnnot) {
    return [];
  }
  const {name: annotName, level} = curAnnot;
  if (level === 'position') {
    return [];
  }
  for (const {name, aminoAcids} of posAnnot.annotations) {
    if (name !== annotName) {
      continue;
    }
    return aminoAcids ?? [];
  }
  return [];
}

/**
 * Generate a lookup of positions for the given annotations.
 *
 * @param curAnnots - Annotation definitions to evaluate.
 * @param positionLookup - Lookup table of positions by number.
 * @param aaColorIdx - Starting color index for amino acid annotations.
 * @returns Mapping of position to `[position, colorIndex, value]` tuples.
 */
export function getAnnotPositions(
  curAnnots: Annotation[],
  positionLookup: Record<number, Position>,
  aaColorIdx = 0
): Record<number, [number, number, string | string[]]> {
  if (curAnnots.length === 0) {
    return {};
  }
  const positions: Record<number, [number, number, string | string[]]> = {};
  for (const curAnnot of curAnnots) {
    const {level, colorRules = []} = curAnnot as Annotation & {colorRules?: string[]};
    const colorRulePatterns = colorRules.map(r => new RegExp(r));
    const colorRulePlains: string[] = [];
    if (level === 'position') {
      for (const posdata of Object.values(positionLookup)) {
        const {position: curPos} = posdata;
        const val = getPosAnnotVal(curAnnot, posdata);
        if (!val) {
          continue;
        }
        let colorIdx = colorRulePatterns.findIndex(p => p.test(val));
        if (colorIdx === -1) {
          const relIdx = colorRulePlains.indexOf(val);
          colorIdx = colorRulePatterns.length + relIdx;
          if (relIdx === -1) {
            // not found, append to the end of colorRulePlains
            colorRulePlains.push(val);
            colorIdx += colorRulePlains.length;
          }
        }
        positions[curPos] = [curPos, colorIdx, val];
      }
    }
    else {
      for (const posdata of Object.values(positionLookup)) {
        const {position: curPos} = posdata;
        const aas = getPosAnnotAAs(curAnnot, posdata);
        if (aas.length === 0) {
          continue;
        }
        if (curPos in positions) {
          const cur = positions[curPos][2] as string[];
          positions[curPos][2] = uniq([...cur, ...aas]).sort();
        }
        else {
          positions[curPos] = [curPos, aaColorIdx, aas];
        }
      }
    }
  }
  return positions;
}

/**
 * Calculate underscore annotation block locations.
 *
 * @param positionLookup - Lookup table of positions by number.
 * @param underscoreAnnots - Underscore annotation definitions.
 * @param seqLength - Total sequence length.
 * @returns Object containing location definitions and a lookup matrix.
 */
export function calcUnderscoreAnnotLocations(
  positionLookup: Record<number, Position>,
  underscoreAnnots: Annotation[],
  seqLength: number
): {locations: any[]; matrix: any[]} {
  const posByAnnot = getPositionsByAnnot(positionLookup, underscoreAnnots);
  const matrix: any[] = new Array(seqLength);
  const locations: any[] = [];
  for (const {annot, positions} of posByAnnot) {
    const {name: annotName, level: annotLevel} = annot;
    if (annotLevel === 'position') {
      for (const [posStart, posEnd] of integersToRange(positions)) {
        const minAvailableLoc = matrixFindMinAvailableLoc(
          posStart,
          posEnd,
          annotName
        );
        locations.push({
          posStart,
          posEnd,
          locIndex: minAvailableLoc,
          annotName,
          annotLevel
        });
      }
    }
    else {
      for (const pos of positions) {
        const minAvailableLoc = matrixFindMinAvailableLoc(pos, pos, annotName);
        locations.push({
          posStart: pos,
          posEnd: pos,
          locIndex: minAvailableLoc,
          annotName,
          annotLevel
        });
      }
    }
  }
  return {
    locations,
    matrix
  };

  function matrixFindMinAvailableLoc(
    posStart: number,
    posEnd: number,
    annotName: string
  ): number {
    const usedLocs: boolean[] = [];
    let maxAvailableLoc = 0;
    for (let pos0 = posStart - 1; pos0 < posEnd; pos0 ++) {
      matrix[pos0] = matrix[pos0] || [];
      for (let idx = 0; idx < matrix[pos0].length; idx ++) {
        if (matrix[pos0][idx]) {
          usedLocs[idx] = true;
        }
      }
      if (matrix[pos0].length > maxAvailableLoc) {
        maxAvailableLoc = matrix[pos0].length;
      }
    }
    let minAvailableLoc = usedLocs.findIndex(val => !val);
    if (minAvailableLoc < 0) {
      minAvailableLoc = maxAvailableLoc;
    }
    for (let pos0 = posStart - 1; pos0 < posEnd; pos0 ++) {
      matrix[pos0][minAvailableLoc] = annotName;
    }
    return minAvailableLoc;
  }
}

