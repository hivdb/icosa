import React from 'react';

/**
 * Hook providing undo/redo history for FASTQ pair operations.
 *
 * @param onChange - Callback invoked with restored payload on undo/redo.
 * @returns Object exposing `pushHistory` helper.
 */
export default function useUndoHistory(onChange: (payload: any) => void) {
  const {current: history} = React.useRef<{array: any[]; index: number}>({
    array: [],
    index: -1
  });

  const pushHistory = React.useCallback(
    (payload: any) => {
      if (!history.array.includes(payload)) {
        history.index++;
        history.array = [...history.array.slice(0, history.index), payload];
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
        let newPayload;
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
  }, [onChange, undo, redo]);

  return {pushHistory};
}
