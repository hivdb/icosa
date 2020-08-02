export function citationIdCompare(a, b) {
  let a0, a1 = a.split(/\./);
  let b0, b1 = a.split(/\./);
  a0 = parseInt(a0);
  b0 = parseInt(b0);
  let diff = a0 - b0;
  if (diff !== 0) {
    return diff;
  }
  a1 = parseInt(a1);
  b1 = parseInt(b1);
  return a1 - b1;
}
