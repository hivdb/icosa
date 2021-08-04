import React from 'react';


export default function useSortState(data, cacheKey) {

  const cacheKeyRef = React.useRef(cacheKey);

  const [sortState, setSortState] = React.useState({
    byColumn: null,
    direction: null,
    sortedData: data
  });

  React.useEffect(
    () => {
      const prevCacheKey = cacheKeyRef;
      if (prevCacheKey !== cacheKey) {
        // cacheKey was updated
        cacheKeyRef.current = cacheKey;
        setSortState({
          byColumn: null,
          direction: null,
          sortedData: data
        });
      }
    },
    [cacheKeyRef, cacheKey, data]
  );

  return [sortState, setSortState];
}
