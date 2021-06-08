import React from 'react';

export default function useUndoHistory(onChange) {
  const {current: history} = React.useRef({
    array: [],
    index: -1
  });

  const pushHistory = React.useCallback(
    payload => {
      if (!history.array.includes(payload)) {
        // if payload was previously referred by history,
        // assume it was caused by an undo/redo operation
        history.index ++;
        history.array = [
          ...history.array.slice(0, history.index),
          payload
        ];
      }
    },
    [history]
  );

  const undo = React.useCallback(
    () => {
      if (history.index > 0) {
        return history.array[-- history.index];
      }
    },
    [history]
  );

  const redo = React.useCallback(
    () => {
      if (history.index < history.array.length - 1) {
        const z = history.array[++ history.index];
        return z;
      }
    },
    [history]
  );

  React.useEffect(
    () => {
      window.addEventListener('keydown', handleKeyDown, false);
      return () => {
        window.removeEventListener('keydown', handleKeyDown, false);
      };

      function handleKeyDown(event) {
        if (event.which === 90) {
          let newPayload;
          if (event.ctrlKey || event.metaKey) {
            if (event.shiftKey) {
              newPayload = redo();
            }
            else {
              newPayload = undo();
            }
          }
          if (newPayload) {
            onChange(newPayload);
          }
        }
      }
    },
    [/* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  return {pushHistory};
}
