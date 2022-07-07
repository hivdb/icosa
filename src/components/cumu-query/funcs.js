const DEFAULT_QUICKLOAD_LIMIT = 2;

export {DEFAULT_QUICKLOAD_LIMIT};

export function calcOffsetLimit({
  size,
  offset,
  lazyLoad,
  quickLoadLimit = DEFAULT_QUICKLOAD_LIMIT
}) {
  let limit;
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


export function calcInitOffsetLimit({
  size,
  curIndex,
  lazyLoad,
  quickLoadLimit = DEFAULT_QUICKLOAD_LIMIT
}) {
  if (curIndex === null || curIndex === undefined) {
    // don't load anything in lazy-loading mode
    // if curIndex is not specified
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
