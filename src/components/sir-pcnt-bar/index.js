import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


SIRPcntBarItem.propTypes = {
  level: PropTypes.number.isRequired,
  pcnt: PropTypes.number.isRequired,
  children: PropTypes.node
};

function SIRPcntBarItem({level, pcnt, children = null}) {
  if (children === null) {
    children = pcnt >= 0.005 ? `${(pcnt * 100).toFixed(0)}%` : '0';
  }
  return (
    <li
     data-level={level}
     data-pcnt={pcnt}
     title={children}
     style={{'--level-pcnt': pcnt}}>
      <span className={style['sir-pcnt']}>
        {children}
      </span>
    </li>
  );
}


SIRPcntBar.propTypes = {
  levelPcnts: PropTypes.arrayOf(
    PropTypes.shape({
      level: PropTypes.number.isRequired,
      pcnt: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};

export default function SIRPcntBar({levelPcnts}) {
  const isEmpty = levelPcnts.every(({pcnt}) => pcnt === 0);
  return <ul className={style['sir-pcnt-bar']}>
    {levelPcnts.map(({level, pcnt}) => (
      <SIRPcntBarItem key={level} level={level} pcnt={pcnt} />
    ))}
    {isEmpty ? (
      <SIRPcntBarItem key="na" level="na" pcnt={1}>
        N/A
      </SIRPcntBarItem>
    ) : null}
  </ul>;
}
