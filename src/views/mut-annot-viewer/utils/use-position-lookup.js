import React from 'react';

export function usePositionLookup(positions) {
  return React.useMemo(
    () => positions.reduce((acc, posdata) => {
      acc[posdata.position] = posdata;
      return acc;
    }, {}),
    [positions]
  );
}
