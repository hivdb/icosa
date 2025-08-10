import React from 'react';
import ProgressBar from 'react-progressbar';

import style from './style.module.scss';

export interface SmoothProgressBarProps {
  loaded: boolean;
  progressText: (progress: number, total: number) => React.ReactNode;
  progress: number;
  nextProgress: number;
  total: number;
  [key: string]: any;
}

/**
 * Display a progress bar that advances smoothly toward the next reported
 * progress value while data is loading.
 *
 * @param loaded - Whether the loading process has completed.
 * @param progressText - Renderer for the textual progress indicator.
 * @param progress - Current progress value.
 * @param nextProgress - Upcoming progress target reported by the backend.
 * @param total - Total number of steps.
 * @param props - Additional props passed to the underlying progress bar.
 * @returns Progress bar element with smooth interpolation.
 */
export default function SmoothProgressBar({
  loaded,
  progressText,
  progress,
  nextProgress,
  total,
  ...props
}: SmoothProgressBarProps) {
  const [estProgress, setEstProgress] = React.useState(progress);
  const prevNextProgressRef = React.useRef(nextProgress);
  const estIntervalRef = React.useRef(100);
  const timeStartRef = React.useRef(new Date().getTime());

  React.useEffect(() => {
    if (prevNextProgressRef.current < nextProgress) {
      setEstProgress(progress);
      estIntervalRef.current = (new Date().getTime() - timeStartRef.current) / progress;
    }
    prevNextProgressRef.current = nextProgress;
  }, [progress, nextProgress]);

  React.useEffect(() => {
    if (loaded) {
      return;
    }
    const id = setTimeout(() => {
      setEstProgress(prev => {
        if (prev < nextProgress) {
          return prev + 1;
        }
        return prev;
      });
    }, estIntervalRef.current);
    return () => clearTimeout(id);
  }, [loaded, nextProgress, estProgress]);

  const completed = Math.round((estProgress / total) * 100);
  return (
    <div
      className={style['progress-bar-container']}
      data-loaded={loaded}>
      {progressText(estProgress, total)}
      <ProgressBar
        color="var(--sierra-color-progress-bar)"
        {...props}
        completed={completed}
      />
    </div>
  );
}
