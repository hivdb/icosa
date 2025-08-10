import React from 'react';
import classNames from 'classnames';
import ReactJSPopup from 'reactjs-popup';

type PopupPosition = `${'top' | 'right' | 'bottom' | 'left'} center`;

import style from './style.module.scss';


const POSITION_NEXT: Record<'top' | 'right' | 'bottom' | 'left', 'top' | 'right' | 'bottom' | 'left'> = {
  top: 'right',
  right: 'bottom',
  bottom: 'left',
  left: 'top'
};
export interface HoverPopupProps {
  noUnderline?: boolean;
  children: React.ReactNode;
  message?: React.ReactNode;
  delay?: number;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HoverPopup({
  noUnderline = false,
  children,
  delay = 100,
  position = 'top',
  message,
  className
}: HoverPopupProps) {
  const classNameArr = className ? className.split(/\s+/) : [];
  classNameArr.push(style['icosa-popup']);

  const positions = React.useMemo<PopupPosition[]>(
    () => {
      let curPos = position;
      const positions: PopupPosition[] = [];
      for (let i = 0; i < 4; i ++) {
        positions.push(`${curPos} center` as PopupPosition);
        curPos = POSITION_NEXT[curPos];
      }
      return positions;
    },
    [position]
  );

  if (!message) {
    return children;
  }
  else {
    return (
      <ReactJSPopup
       on="hover"
       mouseEnterDelay={delay}
       position={positions}
       className={classNames(...classNameArr)}
       closeOnDocumentClick
       keepTooltipInside
       repositionOnResize
       trigger={(
         <span
          data-no-underline={noUnderline ? '' : undefined}
          className={classNames(
            ...classNameArr.map(kls => `${kls}-trigger`)
          )}>
           {children}
         </span>
       )}>
        {message}
      </ReactJSPopup>
    );
  }
}
