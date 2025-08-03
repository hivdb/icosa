import React from 'react';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import createPersistedState from 'use-persisted-state/src';

import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig,
  FastpConfig,
  CutadaptConfig,
  IvarConfig
} from './options-form/prop-types';

/** Combined configuration object used by NGS2CodFreq. */
export interface NGSOptions {
  fastpConfig: FastpConfig;
  cutadaptConfig: CutadaptConfig;
  ivarConfig: IvarConfig;
  saveInBrowser: boolean;
  primerType: 'off' | 'fasta' | 'bed';
  [key: string]: any;
}

const usePersistedOptions = createPersistedState<Partial<NGSOptions>>(
  '--ngs2codfreq-persisted-settings-' +
    window.location.pathname
      .replace(/(?:\/ngs2codfreq|\/by-reads).*$/, '')
      .replaceAll('/', '-')
);

/**
 * Manage options for NGS2CodFreq with persistence in local storage.
 *
 * @returns Tuple containing current options, an update handler and a flag
 * indicating whether the options equal defaults.
 */
export default function useOptions(): [
  NGSOptions,
  (key: string, value: any) => void,
  boolean
] {
  const [persistedOptions, setPersistedOptions] = usePersistedOptions({});
  const [options, setOptions] = React.useState<NGSOptions>({
    fastpConfig: {...defaultFastpConfig},
    cutadaptConfig: {...defaultCutadaptConfig},
    ivarConfig: {...defaultIvarConfig},
    saveInBrowser: true,
    primerType: 'off',
    ...persistedOptions
  });

  const onChange = React.useCallback(
    (key: string, value: any) => {
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
        setPersistedOptions({saveInBrowser: false});
      }
      setOptions(newOptions);
    },
    [options, setPersistedOptions]
  );

  const isDefault = React.useMemo(() => {
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
  }, [options]);

  return [options, onChange, isDefault];
}
