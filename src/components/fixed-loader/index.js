import React from 'react';
import classNames from 'classnames';
import style from './style.module.scss';


export default function FixedLoader({className}) {
  return <div className={classNames(style["lds-ring_fixed"], className)}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>;
}
