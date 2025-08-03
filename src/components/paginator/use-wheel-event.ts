import React from 'react';

interface UseWheelEventProps {
  childItems: unknown[];
  displayNums: number;
  resetScrollOffset: () => void;
  onScroll: (steps: number) => void;
}

export default function useWheelEvent({
  childItems,
  displayNums,
  resetScrollOffset,
  onScroll
}: UseWheelEventProps) {
  const navRef = React.useRef<HTMLElement | null>(null);
  const {current: wheelAccum} = React.useRef({x: 0, y: 0});
  React.useEffect(
    () => {
      const {current: elem} = navRef;
      if (!elem) {
        return;
      }
      elem.addEventListener(
        'wheel',
        handleWheel,
        {passive: false}
      );
      window.addEventListener(
        '--sierra-paginator-reset-scroll',
        resetScrollOffset,
        false
      );
      return () => {
        elem.removeEventListener(
          'wheel',
          handleWheel,
          {passive: false}
        );
        window.removeEventListener(
          '--sierra-paginator-reset-scroll',
          resetScrollOffset,
          false
        );
      };

      function handleWheel(event: WheelEvent & { wheelDeltaX?: number; wheelDeltaY?: number; }) {
        if (childItems.length <= displayNums) {
          return;
        }
        event.preventDefault();
        const wheelStepWidth = 40;
        const localWheelAccumX = wheelAccum.x + (event.wheelDeltaX || 0);
        const localWheelAccumY = wheelAccum.y + (event.wheelDeltaY || event.deltaY);
        const localWheelAccum = Math.sqrt(
          Math.pow(localWheelAccumX, 2) + Math.pow(localWheelAccumY, 2)
        );
        let direction = 1;
        if (Math.abs(localWheelAccumX) > Math.abs(localWheelAccumY)) {
          direction = localWheelAccumX > 0 ? -1 : 1;
        }
        else {
          direction = localWheelAccumY > 0 ? -1 : 1;
        }
        if (localWheelAccum > wheelStepWidth) {
          let steps = localWheelAccum / wheelStepWidth;
          steps = direction * Math.floor(Math.sqrt(steps));
          onScroll(steps);
          wheelAccum.x = 0;
          wheelAccum.y = 0;
        }
        else {
          wheelAccum.x = localWheelAccumX;
          wheelAccum.y = localWheelAccumY;
        }
      }
    },
    [
      wheelAccum,
      navRef,
      childItems,
      displayNums,
      resetScrollOffset,
      onScroll
    ]
  );
  return navRef;
}
