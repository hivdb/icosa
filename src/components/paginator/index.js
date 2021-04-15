import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PseudoItem from './pseudo-item';
import PaginatorItem from './paginator-item';
import PaginatorArrow from './paginator-arrow';
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


function calcOffsets({
  currentSelected,
  currentHovering,
  childItems
}) {
  const currentSelectedIndex = getIndex(currentSelected, childItems);
  const currentHoveringIndex = getIndex(currentHovering, childItems);

  const offset = currentSelectedIndex;
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
  return {offset, hoverOffset, descOffset};
}


function Paginator({
  footnote,
  currentSelected,
  className,
  children
}) {
  const displayNums = 10;
  const childItems = useChildItems(children);
  const {
    scrollOffset,
    resetScrollOffset,
    onScroll
  } = useScrollOffset({
    currentSelected,
    childItems,
    displayNums
  });
  const [currentHovering, setCurrentHovering] = React.useState(null);

  const navRef = useWheelEvent({
    childItems,
    displayNums,
    currentSelected,
    resetScrollOffset,
    onScroll
  });

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

  const {
    offset,
    hoverOffset,
    descOffset
  } = calcOffsets({
    currentSelected,
    currentHovering,
    childItems
  });

  return (
    <nav
     ref={navRef}
     style={{
       '--offset': offset - scrollOffset,
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
      <PaginatorArrow direction={-1} onClick={handleArrowClick} />
      <div className={style['paginator-scrollable-list']}>
        <ol
         className={style['paginator-list']}>
          {childItems.map((props, idx) => (
            <PaginatorItem
             key={idx}
             {...props} 
             currentSelected={currentSelected}
             currentHovering={currentHovering}
             setCurrentHovering={setCurrentHovering} />
          ))}
        </ol>
      </div>
      <PaginatorArrow direction={1} onClick={handleArrowClick} />
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
