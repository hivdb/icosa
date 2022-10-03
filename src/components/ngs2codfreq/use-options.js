import React from 'react';
import set from 'lodash/set';
import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig
} from './options-form/prop-types';
import createPersistedState from 'use-persisted-state/src';

const usePersistedOptions = createPersistedState(
  '--ngs2codfreq-persisted-settings'
);


export default function useOptions() {
  const [persistedOptions, setPersistedOptions] = usePersistedOptions({});
  const [options, setOptions] = React.useState({
    fastpConfig: {...defaultFastpConfig},
    cutadaptConfig: {...defaultCutadaptConfig},
    ivarConfig: {...defaultIvarConfig},
    saveInBrowser: true,
    ...persistedOptions
  });

  const onChange = React.useCallback(
    (key, value) => {
      const newOptions = {...options};
      if (key === '.') {
        Object.assign(newOptions, value);
      }
      else {
        set(newOptions, key, value);
      }
      if (newOptions.saveInBrowser) {
        setPersistedOptions(newOptions);
      }
      else {
        setPersistedOptions({
          saveInBrowser: false
        });
      }
      setOptions(newOptions);
    },
    [options, setPersistedOptions]
  );

  return [options, onChange];
}
