import React from 'react';


export default function useCursorAndVariables({
  initOffset,
  initLimit,
  isCached,
  inputObjs,
  currentSelected: {
    index: loadFirstIndex
  },
  inputUniqKeyName,
  mainInputName,
  maxPerRequest,
  onExtendVariables
}) {
  const [cursor, setCursor] = React.useState({
    loadFirstIndex,
    offset: initOffset,
    limit: initLimit
  });
  const getVariables = React.useCallback(
    ({
      loadFirstIndex,
      offset,
      limit
    }) => {
      const end = offset + limit;
      const queryObjs = [];
      let fetchedCount = 0;
      let isCursorFulfilled = true;

      let idxStart = offset;
      if (loadFirstIndex !== undefined) {
        const loadFirstObj = inputObjs[loadFirstIndex];
        if (!loadFirstObj) {
          throw new Error(
            `InputObjs index out of bound: loadFirstObj=${loadFirstObj}`
          );
        }
        if (!isCached(loadFirstObj[inputUniqKeyName])) {
          // the loadFirstObj is not cached, load it first
          isCursorFulfilled = false;
          idxStart = loadFirstIndex;
        }
      }

      for (let idx = idxStart; idx < end; idx ++) {
        const inputObj = inputObjs[idx];
        if (!inputObj) {
          break;
        }
        if (isCached(inputObj[inputUniqKeyName])) {
          fetchedCount ++;
        }
        else if (queryObjs.length < maxPerRequest) {
          queryObjs.push(inputObj);
        }
        else {
          isCursorFulfilled = false;
        }
      }
      const variables = {};
      variables[mainInputName] = queryObjs;
    
      return {
        variables: onExtendVariables(variables),
        isCursorFulfilled,
        fetchedCount,
        fetchingCount: queryObjs.length
      };
    },
    [
      isCached, inputObjs, inputUniqKeyName,
      mainInputName, maxPerRequest, onExtendVariables
    ]
  );
  const {variables, isCursorFulfilled} = getVariables(cursor);

  return {
    variables,
    isCursorFulfilled,
    getVariables,
    cursor,
    setCursor
  };
}
