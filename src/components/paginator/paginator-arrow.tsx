import React from 'react';
import { getIndex } from './funcs';
import style from './style.module.scss';
import type {PaginatorArrowProps, UsePaginatorArrowProps, PaginatorChildItem} from './types';

function PaginatorArrow({
  direction,
  onClick
}: PaginatorArrowProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(
      `render PaginatorArrow ${direction}`,
      new Date().getTime()
    );
  }

  const handleClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
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

const MemoPaginatorArrow = React.memo(
  PaginatorArrow,
  (prev, next) => (
    next.direction === prev.direction &&
    next.onClick === prev.onClick
  )
);

export default function usePaginatorArrow({
  currentSelected,
  childItems,
  onScroll
}: UsePaginatorArrowProps) {
  const handleArrowClick = React.useCallback(
    (direction: number) => {
      const index = getIndex(currentSelected, childItems);
      const childProps = childItems[index + direction];
      if (childProps && childProps.onClick) {
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
