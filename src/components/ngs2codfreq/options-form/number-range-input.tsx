import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';


export interface NumberRangeInputProps {
  name: string;
  label: string;
  value: number;
  defaultValue?: number;
  onChange: (name: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

/** Combined range/number input with reset to default. */
export default function NumberRangeInput({
  name,
  label,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  children
}: NumberRangeInputProps) {
  const handleSelectAll = React.useCallback(
    event => event.currentTarget.select(),
    []
  );

  const handleChange = React.useCallback(
    event => onChange(
      name,
      Number.parseFloat(event.currentTarget.value)
    ),
    [name, onChange]
  );

  const handleReset = React.useCallback(
    event => {
      event.preventDefault();
      onChange(name, defaultValue);
    },
    [defaultValue, name, onChange]
  );

  return (
    <div className={style['fieldrow']}>
      <label
       className={style['fieldlabel']}
       htmlFor={name}>
        {label}:
        {defaultValue !== undefined && value !== defaultValue ? (
          <div className={style.reset}>
            {' '}(
            <a
             className={style['reset-link']}
             href={`#${name}-reset`}
             onClick={handleReset}>
              reset to default
            </a>
            : {defaultValue})
          </div>
        ) : null}
      </label>
      <div className={classNames(
        style['fieldinput'],
        style['fieldinput-number-range']
      )}>
        <input
         disabled={disabled}
         type="range"
         id={`${name}-range-input`}
         name={name}
         min={min}
         max={max}
         step={step}
         value={value}
         onChange={handleChange} />
        <input
         disabled={disabled}
         type="number"
         id={`${name}-number-input`}
         name={name}
         min={min}
         max={max}
         step={step}
         value={value}
         onClick={handleSelectAll}
         onChange={handleChange} />
      </div>
      {children ?
        <div className={style['fielddesc']}>
          {children}
        </div> : null}
    </div>
  );
}
