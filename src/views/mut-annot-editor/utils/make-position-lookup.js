export function makePositionLookup(positions) {
  return positions.reduce((acc, posdata) => {
    acc[posdata.position] = posdata;
    return acc;
  }, {});
}
