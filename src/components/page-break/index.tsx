import React from 'react';

import style from './style.module.scss';

/**
 * Simple visual separator that forces a page break when printing.
 *
 * @returns A div element styled to indicate a page break.
 */
export default function PageBreak() {
  return <div className={style['page-break']} />;
}

