import React from 'react';
import classNames from 'classnames';
import style from './style.module.scss';


export default function InlineLoader({className}) {
  return <div className={classNames(style["lds-ring"], className)}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>;
}
