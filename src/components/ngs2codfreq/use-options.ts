import React from 'react';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import {useState, useCallback, useMemo} from 'react';
import createPersistedState from '@plq/use-persisted-state';
import localStorage from '@plq/use-persisted-state/lib/storages/local-storage';

import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig,
  type NGSOptions
} from './options-form/types';

const [usePersistedOptions] = createPersistedState(
  '--ngs2codfreq-persisted-settings-' +
  window.location.pathname
    .replace(/(?:\/ngs2codfreq|\/by-reads).*$/, '')
    .replaceAll('/', '-'),
  localStorage
);


/**
 * React hook that manages options for the NGS to CodFreq workflow.
 *
 * It persists the configuration in local storage (when enabled) and
 * provides a change handler to update nested keys.
 *
 * @returns A tuple containing the current options, a change handler and a
 * boolean indicating whether the options are still at their default values.
 */
export default function useOptions(): [NGSOptions, (key: string, value: any) => void, boolean] {
  const [persistedOptions, setPersistedOptions] = usePersistedOptions('persisted-options', {});
  const [options, setOptions] = useState<NGSOptions>({
    fastpConfig: {...defaultFastpConfig},
    cutadaptConfig: {...defaultCutadaptConfig},
    ivarConfig: {...defaultIvarConfig},
    saveInBrowser: true,
    primerType: 'off',
    ...persistedOptions
  });

  const onChange = useCallback(
    (key: string, value: any) => {
      const newOptions: NGSOptions = {...options};
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

  const isDefault = useMemo(
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
