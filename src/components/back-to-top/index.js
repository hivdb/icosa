import React from 'react';
import {
  BiChevronUp as ArrowUp
} from '@react-icons/all-files/bi/BiChevronUp';
import style from './style.module.scss';


function handleClick(evt) {
  evt && evt.preventDefault();
  window.scrollTo(0, 0);
}

export default function BackToTop() {
  return <div className={style['back-to-top-container']}>
    <a
     href="#back-to-top"
     onClick={handleClick}
     className={style['back-to-top']}>
      <ArrowUp />
    </a>
  </div>;
}
