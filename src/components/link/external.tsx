import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';

export interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  noDefaultStyle?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  children,
  className,
  noDefaultStyle = false,
  ...props
}) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    {...props}
    className={classNames(noDefaultStyle ? null : style.link, className)}
  >
    {children}
  </a>
);

export default ExternalLink;

