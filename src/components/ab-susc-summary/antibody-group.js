import React from 'react';

import style from './style.module.scss';

const DISPLAY_RLEVELS = ['susceptible', 'partial-resistance', 'resistant'];



function AntibodyGroup({isCurrent, antibodies, items, onClick}) {

  return <li className={style['antibody-group']}>
    <a
     data-current={isCurrent}
     className={style['antibody-group-anchor']}
     href={`#ab_${antibodies.map(({name}) => name).join('-')}`}
     onClick={onClick}>
      <div className={style['antibodies']}>
        {antibodies.map(({name, abbrName}, idx) => <React.Fragment key={idx}>
          {idx > 0 ? <span className={style['inline-divider']}>+</span> : null}
          {abbrName ? abbrName : name}
        </React.Fragment>)}
      </div>
      <ul className={style['resistance-levels']}>
        {DISPLAY_RLEVELS.map(level => {
          const item = items.find(item => item.resistanceLevel === level) || {};
          const {cumulativeCount = 0} = item;
          return <li
           key={level}
           style={{
             "--cumulative-count": cumulativeCount
           }}
           data-level={level}
           data-count={cumulativeCount}
           className={style['resistance-level']}>
            {level}: {cumulativeCount}
          </li>;
        })}
      </ul>
    </a>
  </li>;

}


export default AntibodyGroup;
