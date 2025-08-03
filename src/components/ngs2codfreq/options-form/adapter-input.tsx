import React from 'react';
import CheckboxInput from '../../checkbox-input';

import style from './style.module.scss';


export interface AdapterInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
  autoValue?: string;
  children?: React.ReactNode;
}

/** Input field for adapter sequences with auto-detect capability. */
export default function AdapterInput({
  name,
  label,
  value,
  onChange,
  disabled,
  autoValue = 'auto',
  children
}: AdapterInputProps) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const handleChange = React.useCallback(
    event => {
      const newValue = event.currentTarget.value;
      onChange(name, newValue === '' ? autoValue : newValue);
    },
    [name, onChange, autoValue]
  );

  const handleReset = React.useCallback(
    event => (
      event.currentTarget.checked ?
        onChange(name, autoValue) :
        textAreaRef.current?.focus()
    ),
    [name, onChange, autoValue]
  );

  return (
    <div className={style['fieldrow']}>
      <label
       className={style['fieldlabel']}
       htmlFor={name}>
        {label}:
      </label>
      <div className={style['fieldinput']}>
        <CheckboxInput
         disabled={disabled}
         id={`${name}-checkbox-input`}
         name={name}
         value="auto"
         onChange={handleReset}
         checked={value === autoValue}>
          Auto detect, or type/paste in:
        </CheckboxInput>
        <textarea
         ref={textAreaRef}
         className={style['sequence-textarea']}
         disabled={disabled}
         id={`${name}-textarea`}
         name={name}
         value={value === autoValue ? '' : value}
         onChange={handleChange} />
      </div>
      {children ?
        <div className={style['fielddesc']}>
          {children}
        </div> : null}
    </div>
  );
}
