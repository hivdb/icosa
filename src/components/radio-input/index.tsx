import React from 'react';
import classNames from 'classnames';
import style from './style.module.scss';

export interface RadioInputProps {
  id: string;
  className?: string;
  name: string;
  value: any;
  title?: string;
  children: React.ReactNode;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function RadioInput({
  id,
  className,
  name,
  value,
  title,
  onChange,
  checked,
  disabled = false,
  children,
  style: userStyle = {}
}: RadioInputProps) {
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
