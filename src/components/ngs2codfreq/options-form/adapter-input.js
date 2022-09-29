import React from 'react';
import PropTypes from 'prop-types';
import CheckboxInput from '../../checkbox-input';

import style from './style.module.scss';


AdapterInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  autoValue: PropTypes.string,
  children: PropTypes.node
};

AdapterInput.defaultProps = {
  autoValue: 'auto'
};

export default function AdapterInput({
  name,
  label,
  value,
  onChange,
  disabled,
  autoValue,
  children
}) {
  const textAreaRef = React.useRef();
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
        textAreaRef.current.focus()
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
