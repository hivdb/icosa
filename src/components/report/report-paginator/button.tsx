import React from 'react';
import style from './style.module.scss';

export interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export default function Button({
  onClick,
  children
}: ButtonProps) {
  return (
    <button
     className={style['navbar-button']}
     onClick={onClick}>
      {children}
    </button>
  );
}
