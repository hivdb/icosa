import React from 'react';

import style from './style.module.scss';


export default function Button({
  onClick,
  children
}) {
  return (
    <button
     className={style['navbar-button']}
     onClick={onClick}>
      {children}
    </button>
  );
}
