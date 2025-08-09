import React from 'react';
import classNames from 'classnames';
import style from './style.module.scss';

export interface LoaderProps {
  inline?: boolean;
  modal?: boolean;
  className?: string;
}

export default function Loader({inline = false, modal = false, className}: LoaderProps) {
  return (
    <div className={classNames(
      style["lds-ring"],
      !modal && inline ? style['lds-ring-inline'] : null,
      modal ? style['lds-ring-modal'] : null,
      className
    )}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
