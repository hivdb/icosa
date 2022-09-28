import React from 'react';
import PropTypes from 'prop-types';

import RadioInput from '../../radio-input';

import style from './style.module.scss';


DisableFlagSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  flag: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  trueWhenDisabled: PropTypes.bool,
  textEnable: PropTypes.string,
  textDisable: PropTypes.string,
  children: PropTypes.node
};

DisableFlagSwitch.defaultProps = {
  trueWhenDisabled: false,
  textEnable: 'Yes',
  textDisable: 'No'
};


export default function DisableFlagSwitch({
  name,
  label,
  flag,
  onChange,
  trueWhenDisabled,
  textEnable,
  textDisable,
  children
}) {
  const handleChange = React.useCallback(
    event => onChange(
      name,
      trueWhenDisabled ?
        event.currentTarget.value === 'disable' :
        event.currentTarget.value === 'enable'
    ),
    [name, trueWhenDisabled, onChange]
  );

  return (
    <div className={style['fieldrow']}>
      <label
       className={style['fieldlabel']}
       htmlFor={name}>
        {label}:
      </label>
      <div className={style['fieldinput']}>
        <RadioInput
         id={`${name}-enable`}
         className={style['flag-switch-radio']}
         name={name}
         value="enable"
         onChange={handleChange}
         checked={trueWhenDisabled ? !flag : flag}>
          {textEnable}
        </RadioInput>
        <RadioInput
         id={`${name}-disable`}
         className={style['flag-switch-radio']}
         name={name}
         value="disable"
         onChange={handleChange}
         checked={trueWhenDisabled ? flag : !flag}>
          {textDisable}
        </RadioInput>
      </div>
      {children ?
        <div className={style['fielddesc']}>
          {children}
        </div> : null}
    </div>
  );
}
