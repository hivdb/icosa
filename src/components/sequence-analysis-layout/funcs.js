const QUICKLOAD_LIMIT = 10;


export function calcOffsetLimit({sequences, offset, lazyLoad}) {
  let limit;
  if (lazyLoad) {
    offset = Math.max(0, offset - Math.floor(QUICKLOAD_LIMIT / 2));
    limit = QUICKLOAD_LIMIT;
  }
  else {
    offset = 0;
    limit = sequences.length;
  }
  return {offset, limit};
}


export function calcInitOffsetLimit({sequences, lazyLoad}) {
  let initOffset = 0, initLimit = 0;
  if (!lazyLoad) {
    initLimit = sequences.length;
  }
  return {initOffset, initLimit};
}
