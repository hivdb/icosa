import React from 'react';
import {BiChevronUp as ArrowUp} from '@react-icons/all-files/bi/BiChevronUp';
import style from './style.module.scss';

/**
 * Scroll the window back to the top when activated.
 *
 * @returns Back-to-top button element.
 */
export default function BackToTop(): JSX.Element {
  const handleClick = (evt?: React.MouseEvent) => {
    evt && evt.preventDefault();
    window.scrollTo(0, 0);
  };

  return (
    <div className={style['back-to-top-container']}>
      <a
        href="#back-to-top"
        onClick={handleClick}
        className={style['back-to-top']}
      >
        <ArrowUp />
      </a>
    </div>
  );
}

