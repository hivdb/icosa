import React from 'react';
import PropTypes from 'prop-types';

import RadioInput from '../../radio-input';

import style from './style.module.scss';


AdapterTrimmingSwitch.propTypes = {
  disableAdapterTrimming: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};


export default function AdapterTrimmingSwitch({
  disableAdapterTrimming,
  onChange
}) {
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
