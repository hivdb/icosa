import React, {useEffect, useRef, ReactNode} from 'react';
import style from './style.module.scss';

/**
 * AutofitGraph automatically reports width changes of its container.
 * It listens to window resize events and calls the provided `onResize`
 * callback whenever the container width changes. When `output`
 * equals `"printable"`, resize monitoring is disabled.
 */
export interface AutofitGraphProps {
  /** Content to render inside the container. */
  children: ReactNode;
  /** Callback triggered with the new width when the container resizes. */
  onResize: (size: { width: number }) => void;
  /** Output mode. When set to `printable`, resizing is skipped. */
  output: string;
}

export default function AutofitGraph({
  children,
  onResize,
  output
}: AutofitGraphProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isPrint = output === 'printable';

  useEffect(() => {
    if (isPrint) {
      return;
    }
    let prevContainerWidth: number | undefined;
    const resizeEvent = () => {
      if (sectionRef.current) {
        const containerWidth = sectionRef.current.clientWidth;
        if (containerWidth !== prevContainerWidth) {
          prevContainerWidth = containerWidth;
          onResize({width: containerWidth});
        }
      }
    };
    window.addEventListener('resize', resizeEvent);
    resizeEvent();
    setTimeout(resizeEvent);
    return () => {
      window.removeEventListener('resize', resizeEvent);
    };
  }, [isPrint, onResize]);

  return (
    <section ref={sectionRef} className={style['report-sequence-qa']}>
      {children}
    </section>
  );
}
