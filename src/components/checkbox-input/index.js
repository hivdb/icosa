import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


const isClipPathPolygonSupported = (() => {
  if (typeof(document) === 'undefined') {
    // assume support when server-side rendering
    return true;
  }
  const elem = document.createElement('span');
  const expected = 'polygon(100% 0px, 100% 100%, 0px 100%)';
  for (const attr of ['webkitClipPath', 'clipPath']) {
    if (elem.style[attr] === undefined) {
      continue;
    }
    elem.style[attr] = expected;
    if (elem.style[attr] === expected) {
      return true;
    }
  }
  return false;
})();

function CheckboxInput({
  id,
  children,
  className,
  style: userStyle,
  ...props
}) {

  const labelRef = createRef();

  return (
    <span
     key={id}
     tabIndex={0}
     onKeyDown={handleKeyDown}
     className={classNames(
       style['general-checkbox-input'],
       className,
       isClipPathPolygonSupported ? style['use-polygon'] : null
     )}>
      <input
       id={id} {...props}
       type="checkbox" />
      <label
       ref={labelRef}
       style={userStyle}
       htmlFor={id}>
        {children}
      </label>
    </span>
  );

  function handleKeyDown(evt) {
    if (evt.key === ' ') {
      evt.preventDefault();
      evt.stopPropagation();
      labelRef.current.click();
    }
  }
}

CheckboxInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.any.isRequired,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  style: PropTypes.object.isRequired
};

CheckboxInput.defaultProps = {
  checked: false,
  disabled: false,
  style: {}
};

export default CheckboxInput;
