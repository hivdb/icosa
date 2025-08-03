import React from 'react';
import style from './style.module.scss';

export interface ScrollBarProps {
  onScroll: (offset: number) => boolean | void;
}

function ScrollBar({onScroll}: ScrollBarProps) {
  const scrollBarRef = React.useRef<HTMLDivElement>(null);
  const dragShadowRef = React.useRef<HTMLDivElement>(null);
  const scrollbarStepRef = React.useRef<HTMLDivElement>(null);
  const xStartRef = React.useRef(0);
  const prevClientXRef = React.useRef(0);
  const stepOffsetRef = React.useRef(0);

  const getStepWidth = React.useCallback(() => {
    const elem = scrollbarStepRef.current;
    if (!elem) return 0;
    return parseFloat(window.getComputedStyle(elem).getPropertyValue('width'));
  }, []);

  const handleMouseDown = React.useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      if (evt.target !== evt.currentTarget) {
        return;
      }
      const rect = scrollBarRef.current!.getBoundingClientRect();
      const xStart = rect.left + (rect.right - rect.left) / 2;
      const xOffset = evt.clientX - xStart;
      const stepOffset = Math.ceil(xOffset / getStepWidth());
      onScroll(stepOffset);
    },
    [onScroll, getStepWidth]
  );

  const handleDragStart = React.useCallback(
    (evt: React.DragEvent<HTMLDivElement>) => {
      xStartRef.current = evt.clientX;
      prevClientXRef.current = evt.clientX;
      stepOffsetRef.current = 0;
      if (evt.dataTransfer && dragShadowRef.current) {
        evt.dataTransfer.setDragImage(dragShadowRef.current, 0, 0);
      }
    },
    []
  );

  const handleDrag = React.useCallback(
    (evt: React.DragEvent<HTMLDivElement>) => {
      const xStart = xStartRef.current;
      const {buttons, clientX} = evt;
      const halfClientWidth = document.body.clientWidth / 2;
      if (buttons === 0) {
        return;
      }
      if (Math.abs(clientX - prevClientXRef.current) > halfClientWidth) {
        return;
      }
      prevClientXRef.current = clientX;

      const xOffset = clientX - xStart;
      const stepOffset = Math.ceil(xOffset / getStepWidth());
      if (stepOffset !== stepOffsetRef.current) {
        const accepted = onScroll(stepOffset - stepOffsetRef.current);
        if (accepted) {
          stepOffsetRef.current = stepOffset;
        }
      }
    },
    [onScroll, getStepWidth]
  );

  return (
    <div
     onMouseDown={handleMouseDown}
     className={style['scrollbar-container']}>
      <div
       draggable
       ref={scrollBarRef}
       onDragStart={handleDragStart}
       onDrag={handleDrag}
       className={style['scrollbar']} />
      <div
       ref={dragShadowRef}
       className={style['scrollbar-drag-shadow']} />
      <div
       ref={scrollbarStepRef}
       className={style['scrollbar-step']} />
    </div>
  );
}

export default React.memo(ScrollBar);
