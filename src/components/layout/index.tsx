import React from 'react';
import classNames from 'classnames';

import '../../styles/globals.scss';
import style from './style.module.scss';

export interface LayoutProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Layout component providing page header and container.
 * Renders a Home link and wraps provided children inside the layout container.
 */
export default function Layout({className, children}: LayoutProps) {
  return (
    <div id="hivdb-layout">
      <ul className={style['layout-header']}>
        <li>
          <a href="/">Home</a>
        </li>
      </ul>
      <div className={classNames(style['layout-container'], className)}>
        {children}
      </div>
    </div>
  );
}
