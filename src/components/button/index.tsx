import React from 'react';
import makeClassNames from 'classnames';

import Link from '../link';
import ExtLink from '../link/external';

import style from './style.module.scss';

const btnStyles = ['default', 'info', 'primary', 'light', 'link'] as const;
const btnSizes = ['xlarge', 'large', 'normal', 'small'] as const;

interface ButtonProps {
  onClick?: React.MouseEventHandler;
  name?: string;
  btnStyle?: typeof btnStyles[number];
  btnSize?: typeof btnSizes[number];
  btnHeight?: number;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  href?: string;
  to?: string;
  type?: string;
  children: React.ReactNode;
}

/**
 * Generic button component that can render as a link or regular button.
 *
 * @param props - {@link ButtonProps}
 * @returns Button element.
 */
export default function Button({
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
}: ButtonProps): JSX.Element {
  const classNames = [
    className,
    style.btn,
    style[`btn-${btnSize}`],
    style[`btn-style-${btnStyle}`]
  ];
  if (btnHeight) {
    classNames.push(style[`btn-height-${btnHeight}`]);
  }
  const finalClassName = makeClassNames(...classNames);

  let btnComponent: any = 'button';
  const rest: Record<string, any> = {
    ...props,
    className: finalClassName,
    disabled,
    role: 'button'
  };
  if (href || to) {
    if (to) {
      btnComponent = Link;
    } else {
      btnComponent = ExtLink;
    }
    rest.noDefaultStyle = true;
    delete rest.type;
  } else {
    rest.type = type;
  }

  return React.createElement(btnComponent, rest, <span>{children}</span>);
}

