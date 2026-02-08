import React from 'react';
import classNames from 'classnames';
import {Link as FoundLink} from 'found';

import style from './style.module.scss';
import type {LinkProps} from './types';

export type {LinkProps};

const Link: React.FC<LinkProps> = ({
  to,
  children,
  linkStyle,
  className,
  noDefaultStyle = false,
  onClick,
  ...props
}) => {
  const openInNewWindow = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e && e.preventDefault();
      window.open(
        to as string,
        '_sierra-help-window',
        'width=960,height=700,resizable,scrollbars=yes,' +
          'menubar=no,toolbar=no,personalbar=no,status=no'
      );
      onClick?.(e);
    },
    [to, onClick]
  );

  if (linkStyle) {
    className = classNames(
      noDefaultStyle ? null : (style as any)[`${linkStyle}-link`],
      className
    );
  }
  className = classNames(noDefaultStyle ? null : style.link, className);
  const Component: React.ElementType = to ? FoundLink : 'a';
  const componentSpecificProps = to ? {to} : {};
  return (
    <Component
      {...props}
      {...componentSpecificProps}
      className={className}
      onClick={linkStyle === 'help' ? openInNewWindow : onClick}
    >
      {children}
    </Component>
  );
};

export default Link;

