import React from 'react';
import React from 'react';
import RadioInput from '../../radio-input';

import style from './style.module.scss';


export interface AdapterTrimmingSwitchProps {
  disableAdapterTrimming: boolean;
  onChange: (name: string, value: boolean) => void;
}

/** Toggle enabling/disabling adapter trimming. */
export default function AdapterTrimmingSwitch({
  disableAdapterTrimming,
  onChange
}: AdapterTrimmingSwitchProps) {
  const handleChange = React.useCallback(
    event => onChange(
      'fastpConfig.disabledAdapterTrimming',
      event.currentTarget.value === 'no'
    ),
    [onChange]
  );

  return (
    <div className={style['fieldrow']}>
      <label
       className={style['fieldlabel']}
       htmlFor="adapterTrimming">
        Adapter trimming:
      </label>
      <div className={style['fieldinput']}>
        <RadioInput
         id="adapterTrimming-enable"
         name="adapterTrimming"
         value="yes"
         onChange={handleChange}
         checked={!disableAdapterTrimming}>
          Yes
        </RadioInput>
        <RadioInput
         id="adapterTrimming-disable"
         name="adapterTrimming"
         value="no"
         onChange={handleChange}
         checked={disableAdapterTrimming}>
          No
        </RadioInput>
      </div>
    </div>
  );
}
