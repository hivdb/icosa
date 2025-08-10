declare module 'react-progressbar' {
  import * as React from 'react';
  interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    completed?: number;
    color?: string;
    [key: string]: any;
  }
  const ProgressBar: React.ComponentType<ProgressBarProps>;
  export default ProgressBar;
}
