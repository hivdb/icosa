import React from 'react';
import nestGet from 'lodash/get';


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
      let fetchingCount = 0;

      let idxStart = offset;
      if (loadFirstIndex !== undefined) {
        const loadFirstObj = inputObjs[loadFirstIndex];
        if (!loadFirstObj) {
          throw new Error(
            `InputObjs index out of bound: loadFirstObj=${loadFirstObj}`
          );
        }
        if (!isCached(nestGet(loadFirstObj, inputUniqKeyName))) {
          // the loadFirstObj is not cached, load it first
          idxStart = loadFirstIndex;
        }
      }

      for (let idx = idxStart; idx < end; idx ++) {
        const inputObj = inputObjs[idx];
        if (!inputObj) {
          break;
        }
        if (isCached(nestGet(inputObj, inputUniqKeyName))) {
          fetchedCount ++;
        }
        else if (fetchingCount < maxPerRequest) {
          fetchingCount ++;
          queryObjs.push(inputObj);
        }
      }
      const variables = {};
      variables[mainInputName] = queryObjs;
    
      return {
        variables: onExtendVariables(variables),
        isEmptyQuery: queryObjs.length === 0,
        fetchedCount,
        fetchingCount
      };
    },
    [
      isCached, inputObjs, inputUniqKeyName,
      mainInputName, maxPerRequest, onExtendVariables
    ]
  );

  const isCursorFulfilled = React.useCallback(
    () => {
      const offset = cursor.offset;
      const limit = cursor.limit;
      const end = offset + limit;
      return inputObjs.slice(offset, end).every(
        inputObj => isCached(nestGet(inputObj, inputUniqKeyName))
      );
    },
    [
      cursor.offset, cursor.limit,
      inputObjs, isCached, inputUniqKeyName
    ]
  );

  const {
    variables,
    isEmptyQuery,
    fetchedCount,
    fetchingCount
  } = getVariables(cursor);

  return {
    variables,
    isEmptyQuery,
    fetchedCount,
    fetchingCount,
    isCursorFulfilled,
    getVariables,
    cursor,
    setCursor
  };
}
