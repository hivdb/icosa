import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import Link from '../link';

import style from './style.module.scss';

const btnStyles = ['default', 'info', 'primary', 'light'];
const btnSizes = ['xlarge', 'large', 'normal', 'small'];


export default class Button extends React.Component {

  static propTypes = {
    onClick: PropTypes.func,
    name: PropTypes.string,
    btnStyle: PropTypes.oneOf(btnStyles).isRequired,
    btnSize: PropTypes.oneOf(btnSizes).isRequired,
    btnHeight: PropTypes.number,
    disabled: PropTypes.bool.isRequired,
    className: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number]),
    href: PropTypes.string,
    to: PropTypes.string,
    type: PropTypes.string
  }

  static defaultProps = {
    btnStyle: 'default',
    btnSize: 'normal',
    disabled: false,
    className: '',
    type: 'button'
  }

  render() {
    const {btnSize, btnStyle, btnHeight, href, to} = this.props;
    let props = Object.assign({}, this.props);
    delete props.children;
    delete props.btnSize;
    delete props.btnStyle;
    delete props.btnHeight;
    props.className = classNames(
      props.className, style.btn, style[`btn-${btnSize}`],
      style[`btn-style-${btnStyle}`]
    );
    if (btnHeight) {
      props.className = classNames(
        props.className, style[`btn-height-${btnHeight}`]
      );
    }
    let BtnComponent = 'button';
    if (href || to) {
      BtnComponent = Link;
      props.noDefaultStyle = true;
      delete props.type;
    }
    props.role = 'button';
    return (
      <BtnComponent
       {...props} role="button">
        <span>{this.props.children}</span>
      </BtnComponent>);
  }

}
