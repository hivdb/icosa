import React from 'react';

import style from './style.module.scss';

export interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const BasicLink: React.FC<BasicLinkProps> = ({children, ...props}) => (
  <a {...props} className={style.link}>
    {children}
  </a>
);

export default BasicLink;

