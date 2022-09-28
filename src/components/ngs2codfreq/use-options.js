import React from 'react';
import set from 'lodash/set';
import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig
} from './options-form/prop-types';


export default function useOptions() {
  const [options, setOptions] = React.useState({
    fastpConfig: {...defaultFastpConfig},
    cutadaptConfig: {...defaultCutadaptConfig},
    ivarConfig: {...defaultIvarConfig}
  });

  const onChange = React.useCallback(
    (key, value) => {
      const newOptions = {...options};
      set(newOptions, key, value);
      setOptions(newOptions);
    },
    [options]
  );

  return [options, onChange];
}
