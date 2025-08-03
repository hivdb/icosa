import React from 'react';
import classNames from 'classnames';

import PseudoItem, { PseudoItemProps } from './pseudo-item';
import usePaginatorList from './paginator-list';
import usePaginatorArrow from './paginator-arrow';
import ScrollBar from './scroll-bar';
import useScrollOffset from './use-scroll-offset';
import useWheelEvent from './use-wheel-event';
import style from './style.module.scss';
import { getIndex, PaginatorChildItem } from './funcs';

function useChildItems(children: React.ReactNode): PaginatorChildItem[] {
  return React.useMemo(
    () => {
      const childArr = React.Children.toArray(children) as React.ReactElement<PseudoItemProps>[];
      const childItems = childArr.map(node => node.props);
      return childItems as PaginatorChildItem[];
    },
    [children]
  );
}

function calcDisplayOffsets({
  currentSelected,
  currentHovering,
  childItems
}: {
  currentSelected?: string;
  currentHovering: string | null;
  childItems: PaginatorChildItem[];
}) {
  const currentSelectedIndex = getIndex(currentSelected || '', childItems);
  const currentHoveringIndex = getIndex(currentHovering || '', childItems);

  const selectedOffset = currentSelectedIndex;
  let descOffset = currentSelectedIndex;
  let hoverOffset = 0;
  if (currentHoveringIndex > -1) {
    descOffset = currentHoveringIndex;
    hoverOffset = Math.sqrt(
      Math.abs(
        currentSelectedIndex - currentHoveringIndex
      )
    );
    if (currentSelectedIndex > currentHoveringIndex) {
      hoverOffset = - hoverOffset;
    }
  }
  return {selectedOffset, hoverOffset, descOffset};
}

export interface PaginatorProps {
  inverseColor?: boolean;
  footnote?: React.ReactNode;
  currentSelected?: string;
  className?: string;
  children: React.ReactNode;
}

function Paginator({
  inverseColor,
  footnote,
  currentSelected,
  className,
  children
}: PaginatorProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(
      `render Paginator`,
      new Date().getTime()
    );
  }

  const displayNums = 10;
  const childItems = useChildItems(children);

  const {
    paginatorList,
    currentHovering
  } = usePaginatorList({
    currentSelected: currentSelected || '',
    childItems
  });

  const {
    scrollOffset,
    resetScrollOffset,
    onScroll
  } = useScrollOffset({
    currentSelected: currentSelected || '',
    childItems,
    displayNums
  });

  const navRef = useWheelEvent({
    childItems,
    displayNums,
    currentSelected: currentSelected || '',
    resetScrollOffset,
    onScroll
  });

  const {
    backwardArrow,
    forwardArrow
  } = usePaginatorArrow({
    currentSelected: currentSelected || '',
    childItems,
    onScroll
  });

  const {
    selectedOffset,
    hoverOffset,
    descOffset
  } = calcDisplayOffsets({
    currentSelected: currentSelected || '',
    currentHovering,
    childItems
  });

  return (
    <nav
     ref={navRef as React.RefObject<HTMLElement>}
     style={{
       '--offset': selectedOffset - scrollOffset,
       '--hover-offset': hoverOffset,
       '--scroll-offset': scrollOffset,
       '--total': childItems.length,
       '--display-nums': displayNums
     } as React.CSSProperties}
     className={classNames(
       className,
       style['paginator-container'],
       inverseColor ? style['inverse-color'] : null
     )}>
      <div
       className={style['paginator-desc']}
       data-is-hovering={!!currentHovering}
       data-is-hovering-selected={currentHovering === currentSelected}>
        {descOffset + 1}{'. '}
        {currentHovering || currentSelected}
      </div>
      {backwardArrow}
      {paginatorList}
      {forwardArrow}
      {childItems.length > displayNums ?
        <ScrollBar onScroll={onScroll} /> : null}
      {footnote ? (
        <div className={style['paginator-footnote']}>
          {footnote}
        </div>
      ) : null}
    </nav>
  );
}

const PaginatorComponent = Paginator as React.FC<PaginatorProps> & { Item: React.FC<PseudoItemProps>; };
PaginatorComponent.Item = PseudoItem;

export default PaginatorComponent;
