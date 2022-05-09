import PropTypes from 'prop-types';
import React from 'react';
import makeClassNames from 'classnames';

import Link from '../link';
import ExtLink from '../link/external';

import style from './style.module.scss';

const btnStyles = ['default', 'info', 'primary', 'light', 'link'];
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
      PropTypes.number
    ]),
    href: PropTypes.string,
    to: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    btnStyle: 'default',
    btnSize: 'normal',
    disabled: false,
    className: '',
    type: 'button'
  };

  render() {
    const {
      btnSize,
      btnStyle,
      btnHeight,
      children, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;
    const {href, to} = props;
    const classNames = [
      props.className,
      style.btn,
      style[`btn-${btnSize}`],
      style[`btn-style-${btnStyle}`]
    ];
    if (btnHeight) {
      classNames.push(style[`btn-height-${btnHeight}`]);
    }
    props.className = makeClassNames(...classNames);
    let btnComponent = 'button';
    if (href || to) {
      if (to) {
        btnComponent = Link;
      }
      else {
        btnComponent = ExtLink;
      }
      props.noDefaultStyle = true;
      delete props.type;
    }
    props.role = 'button';
    return React.createElement(
      btnComponent,
      props,
      <span>{this.props.children}</span>
    );
  }

}
