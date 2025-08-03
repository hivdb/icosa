import React from 'react';

/**
 * Maintain an undo/redo history stack for a list of values.
 * @param onChange - callback invoked when undo/redo triggers a change.
 */
export default function useUndoHistory<T>(onChange: (payload: T) => void) {
  const {current: history} = React.useRef<{array: T[]; index: number}>({
    array: [],
    index: -1
  });

  const pushHistory = React.useCallback(
    (payload: T) => {
      if (!history.array.includes(payload)) {
        history.index++;
        history.array = [
          ...history.array.slice(0, history.index),
          payload
        ];
      }
    },
    [history]
  );

  const undo = React.useCallback(() => {
    if (history.index > 0) {
      return history.array[--history.index];
    }
  }, [history]);

  const redo = React.useCallback(() => {
    if (history.index < history.array.length - 1) {
      return history.array[++history.index];
    }
  }, [history]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.which === 90) {
        let newPayload: T | undefined;
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            newPayload = redo();
          } else {
            newPayload = undo();
          }
        }
        if (newPayload) {
          onChange(newPayload);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown, false);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [/* eslint-disable-line react-hooks/exhaustive-deps */]);

  return {pushHistory};
}
