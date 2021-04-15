import React from 'react';

export default function useWheelEvent({
  childItems,
  displayNums,
  currentSelected,
  resetScrollOffset,
  onScroll
}) {
  const navRef = React.useRef();
  const {current: wheelAccum} = React.useRef({x: 0, y: 0});
  React.useEffect(
    () => {
      const {current: elem} = navRef;
      elem.addEventListener(
        'wheel', handleWheel, {passive: false}
      );
      window.addEventListener(
        '--sierra-paginator-reset-scroll',
        resetScrollOffset,
        false
      );
      return () => {
        elem.removeEventListener(
          'wheel', handleWheel, {passive: false}
        );
        window.removeEventListener(
          '--sierra-paginator-reset-scroll',
          resetScrollOffset,
          false
        );
      };

      function handleWheel(event) {
        if (childItems.length <= displayNums) {
          return;
        }
        event.preventDefault();
        const wheelStepWidth = 40;
        const localWheelAccumX = wheelAccum.x + event.wheelDeltaX;
        const localWheelAccumY = wheelAccum.y + event.wheelDeltaY;
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


