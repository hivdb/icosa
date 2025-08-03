import React from 'react';

/**
 * Hook providing a simple publish/subscribe mechanism for auto-saving.
 * @returns Handlers to add/remove/trigger auto-save callbacks.
 */
export default function useAutoSave<T = unknown>() {
  const autoSaveHandlers = React.useRef<Array<(...args: T[]) => void>>([]);
  const addAutoSave = React.useCallback(
    (cb: (...args: T[]) => void) => autoSaveHandlers.current.push(cb),
    []
  );
  const removeAutoSave = React.useCallback(
    (cb: (...args: T[]) => void) => {
      const {current} = autoSaveHandlers;
      const idx = current.indexOf(cb);
      if (idx > -1) {
        current.splice(idx, 1);
      }
    },
    []
  );
  const triggerAutoSave = React.useCallback(
    (...args: T[]) => {
      for (const handler of autoSaveHandlers.current) {
        handler(...args);
      }
    },
    []
  );

  const clearAutoSave = React.useCallback(
    () => (autoSaveHandlers.current = []),
    []
  );

  return {
    addAutoSave,
    removeAutoSave,
    triggerAutoSave,
    clearAutoSave
  };
}
