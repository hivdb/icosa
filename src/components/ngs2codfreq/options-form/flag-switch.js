import React from 'react';
import PropTypes from 'prop-types';

import RadioInput from '../../radio-input';

import style from './style.module.scss';


DisableFlagSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  valueChoices: PropTypes.array.isRequired,
  textChoices: PropTypes.array.isRequired,
  children: PropTypes.node
};


export default function DisableFlagSwitch({
  name,
  label,
  value,
  onChange,
  valueChoices,
  textChoices,
  children
}) {
  const handleChange = React.useCallback(
    event => onChange(
      name,
      valueChoices[Number.parseInt(event.currentTarget.value)]
    ),
    [name, valueChoices, onChange]
  );

  return (
    <div className={style['fieldrow']}>
      <label
       className={style['fieldlabel']}
       htmlFor={name}>
        {label}:
      </label>
      <div className={style['fieldinput']}>
        {valueChoices.map(
          (val, idx) => (
            <RadioInput
             id={`${name}-${idx}`}
             key={`${name}-${idx}`}
             className={style['switch-radio']}
             name={name}
             value={idx}
             onChange={handleChange}
             checked={value === val}>
              {textChoices[idx]}
            </RadioInput>
          )
        )}
      </div>
      {children ?
        <div className={style['fielddesc']}>
          {children}
        </div> : null}
    </div>
  );
}
