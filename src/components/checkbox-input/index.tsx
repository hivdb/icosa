import React, {createRef} from 'react';
import classNames from 'classnames';

import style from './style.module.scss';

const isClipPathPolygonSupported = (() => {
  if (typeof document === 'undefined') {
    return true;
  }
  const elem = document.createElement('span');
  const expected = 'polygon(100% 0px, 100% 100%, 0px 100%)';
  for (const attr of ['webkitClipPath', 'clipPath'] as const) {
    if ((elem.style as any)[attr] === undefined) {
      continue;
    }
    (elem.style as any)[attr] = expected;
    if ((elem.style as any)[attr] === expected) {
      return true;
    }
  }
  return false;
})();

export interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  className?: string;
  value: any;
  children: React.ReactNode;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  checked?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function CheckboxInput({
  id,
  children,
  className,
  style: userStyle = {},
  ...props
}: CheckboxInputProps) {
  const labelRef = createRef<HTMLLabelElement>();

  return (
    <span
      key={id}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={classNames(
        style['general-checkbox-input'],
        className,
        isClipPathPolygonSupported ? style['use-polygon'] : null
      )}
    >
      <input id={id} {...props} type="checkbox" />
      <label ref={labelRef} style={userStyle} htmlFor={id}>
        {children}
      </label>
    </span>
  );

  function handleKeyDown(evt: React.KeyboardEvent<HTMLSpanElement>) {
    if (evt.key === ' ') {
      evt.preventDefault();
      evt.stopPropagation();
      labelRef.current?.click();
    }
  }
}

export default CheckboxInput;

