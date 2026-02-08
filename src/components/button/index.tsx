import React from 'react';
import makeClassNames from 'classnames';

import Link from '../link';
import ExtLink from '../link/external';
import type {ButtonProps} from './types';

import style from './style.module.scss';

export type {ButtonStyle, ButtonSize, ButtonProps} from './types';

/**
 * Render a styled button or link element depending on provided props.
 *
 * @param props - {@link ButtonProps} describing button behaviour and style.
 * @returns A React element representing the button or link.
 */
const Button: React.FC<ButtonProps> = ({
  btnStyle = 'default',
  btnSize = 'normal',
  disabled = false,
  className = '',
  type = 'button',
  btnHeight,
  children,
  href,
  to,
  ...props
}) => {
  const classNames = [
    className,
    style.btn,
    style[`btn-${btnSize}`],
    style[`btn-style-${btnStyle}`]
  ];

  if (btnHeight) {
    classNames.push(style[`btn-height-${btnHeight}`]);
  }

  const combinedClassName = makeClassNames(...classNames);

  let Component: React.ElementType = 'button';
  const componentProps: Record<string, unknown> = { ...props };

  // Ensure style-related props are not forwarded to the DOM to avoid React warnings
  delete componentProps.btnStyle;
  delete componentProps.btnSize;
  delete componentProps.btnHeight;

  let componentSpecificProps: Record<string, unknown> = {};
  if (href || to) {
    Component = to ? Link : ExtLink;
    componentSpecificProps = to ? {to} : {href};
    componentProps.noDefaultStyle = true;
  } else {
    componentProps.type = type;
  }

  return (
    <Component
      className={combinedClassName}
      disabled={disabled}
      role="button"
      {...componentSpecificProps}
      {...componentProps}
    >
      <span>{children}</span>
    </Component>
  );
};

export default Button;
