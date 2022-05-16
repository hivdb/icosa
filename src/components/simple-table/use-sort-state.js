import React from 'react';


export default function useSortState(data) {
  const prevData = React.useRef(data);
  const [sortState, setSortState] = React.useState({
    byColumn: null,
    direction: null,
    sortedData: data
  });

  React.useEffect(
    () => {
      if (prevData.current !== data) {
        setSortState({
          byColumn: null,
          direction: null,
          sortedData: data
        });
      }
    },
    [data]
  );

  return [sortState, setSortState];
}
