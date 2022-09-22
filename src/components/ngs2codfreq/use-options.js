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
      set(options, key, value);
      setOptions(options);
    },
    [options]
  );

  return [options, onChange];
}
