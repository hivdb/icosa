import React from 'react';


export default function useSortState(data) {

  const [sortState, setSortState] = React.useState({
    byColumn: null,
    direction: null,
    sortedData: data
  });

  return [sortState, setSortState];
}
