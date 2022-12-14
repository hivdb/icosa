import React from 'react';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig
} from './options-form/prop-types';
import createPersistedState from 'use-persisted-state/src';

const usePersistedOptions = createPersistedState(
  '--ngs2codfreq-persisted-settings-' +
  window.location.pathname
    .replace(/(?:\/ngs2codfreq|\/by-reads).*$/, '')
    .replaceAll('/', '-')
);


export default function useOptions() {
  const [persistedOptions, setPersistedOptions] = usePersistedOptions({});
  const [options, setOptions] = React.useState({
    fastpConfig: {...defaultFastpConfig},
    cutadaptConfig: {...defaultCutadaptConfig},
    ivarConfig: {...defaultIvarConfig},
    saveInBrowser: true,
    primerType: 'off',
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

  const isDefault = React.useMemo(
    () => {
      const {
        fastpConfig,
        cutadaptConfig,
        ivarConfig,
        primerType
      } = options;
      return (
        isEqual(fastpConfig, defaultFastpConfig) &&
        isEqual(cutadaptConfig, defaultCutadaptConfig) &&
        isEqual(ivarConfig, defaultIvarConfig) &&
        primerType === 'off'
      );
    },
    [options]
  );

  return [options, onChange, isDefault];
}
