import React from 'react';


export default function useAutoSave() {
  const autoSaveHandlers = React.useRef([]);
  const addAutoSave = React.useCallback(
    cb => autoSaveHandlers.current.push(cb),
    []
  );
  const removeAutoSave = React.useCallback(
    cb => {
      const {current} = autoSaveHandlers;
      const idx = current.indexOf(cb);
      if (idx > -1) {
        current.splice(idx, 1);
      }
    },
    []
  );
  const triggerAutoSave = React.useCallback(
    (...args) => {
      for (const handler of autoSaveHandlers.current) {
        handler(...args);
      }
    },
    []
  );

  const clearAutoSave = React.useCallback(
    () => autoSaveHandlers.current = [],
    []
  );

  return {
    addAutoSave,
    removeAutoSave,
    triggerAutoSave,
    clearAutoSave
  };
}
