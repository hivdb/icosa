/**
 * Functions for calculating cursor offsets and limits when fetching
 * paginated data in a "cumulative" fashion.
 */

export const DEFAULT_QUICKLOAD_LIMIT = 2;

export interface OffsetLimitOptions {
  size: number;
  offset: number;
  lazyLoad: boolean;
  quickLoadLimit?: number;
}

export interface OffsetLimitResult {
  loadFirstIndex: number;
  offset: number;
  limit: number;
}

/**
 * Calculate the next offset and limit for fetching data.
 */
export function calcOffsetLimit({
  size,
  offset,
  lazyLoad,
  quickLoadLimit = DEFAULT_QUICKLOAD_LIMIT
}: OffsetLimitOptions): OffsetLimitResult {
  let limit: number;
  const loadFirstIndex = offset;

  if (lazyLoad) {
    limit = quickLoadLimit;
    if (limit >= 3) {
      offset = Math.max(0, offset - Math.floor((limit - 1) / 2));
    }
  }
  else {
    limit = size;
    offset = 0;
  }
  limit = Math.min(limit, size - offset);

  return {loadFirstIndex, offset, limit};
}

export interface InitOffsetLimitOptions {
  size: number;
  curIndex?: number | null;
  lazyLoad: boolean;
  quickLoadLimit?: number;
}

export interface InitOffsetLimitResult {
  initOffset: number;
  initLimit: number;
}

/**
 * Calculate the initial offset and limit for loading data based on the
 * current selected index.
 */
export function calcInitOffsetLimit({
  size,
  curIndex,
  lazyLoad,
  quickLoadLimit = DEFAULT_QUICKLOAD_LIMIT
}: InitOffsetLimitOptions): InitOffsetLimitResult {
  if (curIndex === null || curIndex === undefined) {
    // don't load anything in lazy-loading mode if curIndex is not specified
    let initOffset = 0, initLimit = 0;
    if (!lazyLoad) {
      initLimit = size;
    }
    return {initOffset, initLimit};
  }
  else {
    const {offset, limit} = calcOffsetLimit({
      size,
      offset: curIndex,
      lazyLoad,
      quickLoadLimit
    });
    return {
      initOffset: offset,
      initLimit: limit
    };
  }
}

