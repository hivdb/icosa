const QUICKLOAD_LIMIT = 5;


export function calcOffsetLimit({
  allSequenceReads,
  offset,
  lazyLoad,
  quickLoadLimit = QUICKLOAD_LIMIT
}) {
  // quickLoadLimit must not be less than 3
  let limit = Math.max(3, quickLoadLimit);
  if (lazyLoad) {
    offset = Math.max(0, offset - Math.floor((limit - 1) / 2));
  }
  else {
    offset = 0;
    limit = allSequenceReads.length;
  }
  return {offset, limit};
}


export function calcInitOffsetLimit({allSequenceReads, lazyLoad}) {
  let initOffset = 0, initLimit = 0;
  if (!lazyLoad) {
    initLimit = allSequenceReads.length;
  }
  return {initOffset, initLimit};
}
