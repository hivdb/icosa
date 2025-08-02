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

  const completed = parseInt((estProgress / total) * 100, 10);
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
