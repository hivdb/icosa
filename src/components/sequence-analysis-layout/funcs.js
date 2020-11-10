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


export function getCurrentSelected({
  match: {location = {query: {}}},
  lazyLoad,
  sequences
}) {
  if (!lazyLoad) { return sequences[0]; }
  const {query: {header}} = location;
  if (!header) {
    return {index: 0, header: sequences[0].header};
  }
  const index = Math.max(
    0, sequences.findIndex(({header: seqH}) => seqH === header)
  );
  return {index, header: sequences[index].header};
}
