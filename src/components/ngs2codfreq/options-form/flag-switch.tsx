import React from 'react';
import RadioInput from '../../radio-input';

import style from './style.module.scss';

export interface DisableFlagSwitchProps<T> {
  name: string;
  label: string;
  value: T;
  onChange: (name: string, value: T) => void;
  valueChoices: T[];
  textChoices: string[];
  children?: React.ReactNode;
}

/** Generic radio switch for toggling between values. */
export default function DisableFlagSwitch<T>({
  name,
  label,
  value,
  onChange,
  valueChoices,
  textChoices,
  children
}: DisableFlagSwitchProps<T>) {
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
