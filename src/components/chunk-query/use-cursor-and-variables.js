import React from 'react';


export default function useCursorAndVariables({
  initOffset,
  initLimit,
  isCached,
  inputObjs,
  inputUniqKeyName,
  mainInputName,
  maxPerRequest,
  onExtendVariables
}) {
  const [cursor, setCursor] = React.useState({
    offset: initOffset,
    limit: initLimit
  });
  const getVariables = React.useCallback(
    ({
      offset,
      limit
    }) => {
      const end = offset + limit;
      const queryObjs = [];
      let fetchedCount = 0;
      let isCursorFulfilled = true;
      for (let idx = offset; idx < end; idx ++) {
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
