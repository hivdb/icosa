import React from 'react';
import makeClassNames from 'classnames';

import Link from '../link';
import ExtLink from '../link/external';

import style from './style.module.scss';

export type ButtonStyle = 'default' | 'info' | 'primary' | 'light' | 'link';
export type ButtonSize = 'xlarge' | 'large' | 'normal' | 'small';

export interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  name?: string;
  btnStyle?: ButtonStyle;
  btnSize?: ButtonSize;
  btnHeight?: number;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  href?: string;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

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
  delete (componentProps as any).btnStyle;
  delete (componentProps as any).btnSize;
  delete (componentProps as any).btnHeight;

  let componentSpecificProps: Record<string, unknown> = {};
  if (href || to) {
    Component = to ? Link : ExtLink;
    componentSpecificProps = to ? {to} : {href};
    (componentProps as any).noDefaultStyle = true;
  } else {
    (componentProps as any).type = type;
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
