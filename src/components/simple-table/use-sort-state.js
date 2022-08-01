import React from 'react';


export default function useSortState(data) {
  const prevData = React.useRef(data);
  const [sortState, setSortState] = React.useState({
    columns: [],
    sortedData: data
  });

  React.useEffect(
    () => {
      if (prevData.current !== data) {
        setSortState({
          columns: [],
          sortedData: data
        });
      }
    },
    [data]
  );

  return [sortState, setSortState];
}
