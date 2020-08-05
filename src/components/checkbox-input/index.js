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

  constructor() {
    super(...arguments);
    this.labelRef = createRef();
  }

  handleKeyDown = (evt) => {
    if (evt.key === ' ') {
      evt.preventDefault();
      evt.stopPropagation();
      this.labelRef.current.click();
    }
  }

  render() {
    const {id, children, className, style: userStyle, ...props} = this.props;
    return (
      <span
       tabIndex={0}
       onKeyDown={this.handleKeyDown}
       className={classNames(
         style['general-checkbox-input'], className,
         isClipPathPolygonSupported ? style['use-polygon'] : null)
       }>
        <input
         id={id} {...props}
         type="checkbox" />
        <label
         ref={this.labelRef}
         style={userStyle}
         htmlFor={id}>
          {children}
        </label>
      </span>
    );
  }
}
