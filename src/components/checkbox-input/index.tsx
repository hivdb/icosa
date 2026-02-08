import React, {createRef} from 'react';
import classNames from 'classnames';
import type {CheckboxInputProps} from './types';

import style from './style.module.scss';

export type {CheckboxInputProps} from './types';

const isClipPathPolygonSupported = (() => {
  if (typeof document === 'undefined') {
    return true;
  }
  const elem = document.createElement('span');
  const expected = 'polygon(100% 0px, 100% 100%, 0px 100%)';
  const elemStyle = elem.style as unknown as Record<string, string | undefined>;
  for (const attr of ['webkitClipPath', 'clipPath']) {
    if (elemStyle[attr] === undefined) {
      continue;
    }
    elemStyle[attr] = expected;
    if (elemStyle[attr] === expected) {
      return true;
    }
  }
  return false;
})();

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

