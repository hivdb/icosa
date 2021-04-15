import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PseudoItem from './pseudo-item';
import usePaginatorList from './paginator-list';
import usePaginatorArrow from './paginator-arrow';
import ScrollBar from './scroll-bar';
import useScrollOffset from './use-scroll-offset';
import useWheelEvent from './use-wheel-event';
import style from './style.module.scss';
import {getIndex} from './funcs';


function useChildItems(children) {
  return React.useMemo(
    () => {
      let childArr = children;
      if (!(children instanceof Array)) {
        childArr = [children];
      }
      const childItems = childArr.map(node => node.props);
      return childItems;
    },
    [children]
  );
}


function calcDisplayOffsets({
  currentSelected,
  currentHovering,
  childItems
}) {
  const currentSelectedIndex = getIndex(currentSelected, childItems);
  const currentHoveringIndex = getIndex(currentHovering, childItems);

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


function Paginator({
  footnote,
  currentSelected,
  className,
  children
}) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(
      `render Paginator`,
      (new Date()).getTime()
    );
  }

  const displayNums = 10;
  const childItems = useChildItems(children);

  const {
    paginatorList,
    currentHovering
  } = usePaginatorList({
    currentSelected,
    childItems
  });

  const {
    scrollOffset,
    resetScrollOffset,
    onScroll
  } = useScrollOffset({
    currentSelected,
    childItems,
    displayNums
  });

  const navRef = useWheelEvent({
    childItems,
    displayNums,
    currentSelected,
    resetScrollOffset,
    onScroll
  });

  const {
    backwardArrow,
    forwardArrow
  } = usePaginatorArrow({
    currentSelected,
    childItems,
    onScroll
  });

  const {
    selectedOffset,
    hoverOffset,
    descOffset
  } = calcDisplayOffsets({
    currentSelected,
    currentHovering,
    childItems
  });

  return (
    <nav
     ref={navRef}
     style={{
       '--offset': selectedOffset - scrollOffset,
       '--hover-offset': hoverOffset,
       '--scroll-offset': scrollOffset,
       '--total': childItems.length,
       '--display-nums': displayNums
     }}
     className={classNames(className, style['paginator-container'])}>
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


Paginator.propTypes = {
  footnote: PropTypes.node,
  currentSelected: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

Paginator.Item = PseudoItem;

export default Paginator;
