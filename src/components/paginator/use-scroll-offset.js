import React from 'react';
import {getIndex} from './funcs';


function calcInitScrollOffset({
  currentSelected,
  childItems,
  displayNums
}) {
  const itemNums = childItems.length;
  let scrollOffset = 0;
  if (itemNums > displayNums) {
    scrollOffset = Math.min(
      Math.max(
        getIndex(
          currentSelected,
          childItems
        ) - parseInt(displayNums / 2) + 1,
        0
      ),
      itemNums - displayNums
    );
  }
  return scrollOffset;
}


export default function useScrollOffset({
  currentSelected,
  childItems,
  displayNums
}) {
  const initScrollOffset = React.useMemo(
    () => calcInitScrollOffset({
      currentSelected,
      childItems,
      displayNums
    }),
    [currentSelected, childItems, displayNums]
  );
  const [scrollOffset, setScrollOffset] = React.useState(initScrollOffset);

  const resetScrollOffset = React.useCallback(
    () => {
      const scrollOffset = calcInitScrollOffset({
        currentSelected,
        childItems,
        displayNums
      });
      setScrollOffset(scrollOffset);
    },
    [
      currentSelected,
      childItems,
      setScrollOffset,
      displayNums
    ]
  );

  const onScroll = React.useCallback(
    direction => {
      let newScrollOffset = scrollOffset;
      if (childItems.length <= displayNums) {
        return false;
      }
      newScrollOffset += direction;
      let acceptFlag = true;
      const maxOffset = childItems.length - displayNums;
      if (scrollOffset < 0) {
        newScrollOffset = 0;
        acceptFlag = false;
      }
      else if (scrollOffset > maxOffset) {
        newScrollOffset = maxOffset;
        acceptFlag = false;
      }
      setScrollOffset(newScrollOffset);
      return acceptFlag;
    },
    [
      childItems.length,
      scrollOffset,
      setScrollOffset,
      displayNums
    ]
  );

  return {
    scrollOffset,
    setScrollOffset,
    resetScrollOffset,
    onScroll
  };

}
