import React from 'react';
import style from './style.module.scss';

interface SIRPcntBarItemProps {
  level: string;
  pcnt: number;
  children?: React.ReactNode;
}

function SIRPcntBarItem({level, pcnt, children = null}: SIRPcntBarItemProps) {
  if (children === null) {
    children = pcnt >= 0.005 ? `${(pcnt * 100).toFixed(0)}%` : '0';
  }
  return (
    <li
     data-level={level}
     data-pcnt={pcnt}
     title={children as string}
     style={{'--level-pcnt': pcnt} as React.CSSProperties}>
      <span className={style['sir-pcnt']}>
        {children}
      </span>
    </li>
  );
}

interface LevelPcnt {
  level: string;
  pcnt: number;
}

export interface SIRPcntBarProps {
  levelPcnts: LevelPcnt[];
}

/**
 * Display percentage bars for S/I/R levels.
 */
export default function SIRPcntBar({levelPcnts}: SIRPcntBarProps) {
  const isEmpty = levelPcnts.every(({pcnt}) => pcnt === 0);
  return (
    <ul className={style['sir-pcnt-bar']}>
      {levelPcnts.map(({level, pcnt}) => (
        <SIRPcntBarItem key={level} level={level} pcnt={pcnt} />
      ))}
      {isEmpty ? (
        <SIRPcntBarItem key="na" level="na" pcnt={1}>
          N/A
        </SIRPcntBarItem>
      ) : null}
    </ul>
  );
}
