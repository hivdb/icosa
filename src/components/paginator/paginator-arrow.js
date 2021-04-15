import React from 'react';
import PropTypes from 'prop-types';

import {getIndex} from './funcs';
import style from './style.module.scss';


function PaginatorArrow({
  direction,
  onClick
}) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(
      `render PaginatorArrow ${direction}`,
      (new Date()).getTime()
    );
  }

  const handleClick = React.useCallback(
    evt => {
      evt.preventDefault();
      onClick(direction);
    },
    [direction, onClick]
  );

  return (
    <a
     href={`#paginator-${direction > 0 ? 'next' : 'prev'}`}
     onClick={handleClick}
     className={style['paginator-arrow']}
     data-direction={direction}>
      <span className={style['paginator-arrow_desc']}>
        {direction > 0 ? 'Next' : 'Prev'}
      </span>
    </a>
  );

}


PaginatorArrow.propTypes = {
  direction: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

const MemoPaginatorArrow = React.memo(
  PaginatorArrow,
  (prev, next) => {
    return (
      next.direction === prev.direction &&
      next.onClick === prev.onClick
    );
  }
);


export default function usePaginatorArrow({
  currentSelected,
  childItems,
  onScroll
}) {
  const handleArrowClick = React.useCallback(
    direction => {
      let index = getIndex(currentSelected, childItems);
      const childProps = childItems[index + direction];
      if (childProps) {
        childProps.onClick();
      }
      onScroll(direction);
    },
    [childItems, currentSelected, onScroll]
  );

  return {
    backwardArrow: (
      <MemoPaginatorArrow
       direction={-1}
       onClick={handleArrowClick} />
    ),
    forwardArrow: (
      <MemoPaginatorArrow
       direction={1}
       onClick={handleArrowClick} />
    )
  };
}
