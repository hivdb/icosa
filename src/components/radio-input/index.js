import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.module.scss';


RadioInput.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  title: PropTypes.string,
  children: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object
};

RadioInput.defaultProps = {
  style: {},
  disabled: false
};


export default function RadioInput({
  id,
  className,
  name,
  value,
  title,
  onChange,
  checked,
  disabled,
  children,
  style: userStyle
}) {
  return (
    <span
     title={title}
     className={classNames(style['general-radio-input'], className)}>
      <input
       id={id}
       type="radio"
       name={name}
       value={value}
       onChange={onChange}
       disabled={disabled}
       checked={checked} />
      <label
       data-disabled={disabled}
       style={userStyle}
       htmlFor={id}>
        {children}
      </label>
    </span>
  );
}
