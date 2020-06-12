import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.scss';


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

export default class CheckboxInput extends React.Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    value: PropTypes.any.isRequired,
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired
  }

  static defaultProps = {
    checked: false,
    disabled: false,
    style: {}
  }

  render() {
    const {id, children, className, style: userStyle, ...props} = this.props;
    return (
      <span className={classNames(
        style.generalCheckboxInput, className,
        isClipPathPolygonSupported ? style.usePolygon : null)}>
        <input
         id={id} {...props}
         type="checkbox" />
        <label
         style={userStyle}
         htmlFor={id}>
          {children}
        </label>
      </span>
    );
  }
}
