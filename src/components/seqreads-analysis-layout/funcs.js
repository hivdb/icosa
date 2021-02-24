const QUICKLOAD_LIMIT = 10;


export function calcOffsetLimit({allSequenceReads, offset, lazyLoad}) {
  let limit;
  if (lazyLoad) {
    offset = Math.max(0, offset - Math.floor(QUICKLOAD_LIMIT / 2));
    limit = QUICKLOAD_LIMIT;
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
