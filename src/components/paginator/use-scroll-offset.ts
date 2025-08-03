import React from 'react';
import { getIndex, PaginatorChildItem } from './funcs';

interface UseScrollOffsetProps {
  currentSelected: string;
  childItems: PaginatorChildItem[];
  displayNums: number;
}

function calcInitScrollOffset({
  currentSelected,
  childItems,
  displayNums
}: UseScrollOffsetProps): number {
  const itemNums = childItems.length;
  let scrollOffset = 0;
  if (itemNums > displayNums) {
    scrollOffset = Math.min(
      Math.max(
        getIndex(
          currentSelected,
          childItems
        ) - Math.floor(displayNums / 2) + 1,
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
}: UseScrollOffsetProps) {
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
    (direction: number) => {
      let newScrollOffset = scrollOffset;
      if (childItems.length <= displayNums) {
        return false;
      }
      newScrollOffset += direction;
      let acceptFlag = true;
      const maxOffset = childItems.length - displayNums;
      if (newScrollOffset < 0) {
        newScrollOffset = 0;
        acceptFlag = false;
      }
      else if (newScrollOffset > maxOffset) {
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
