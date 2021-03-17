import React from 'react';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';

import style from './style.module.scss';


function formatPercent(percent) {
  return round(percent, percent >= 10 ? 0 : 1) + '%';
}


function Mutation({text, isUnsequenced, totalReads, allAAReads}) {
  const hasTotalReads = totalReads && totalReads > 0;
  const hasAAReads = allAAReads && allAAReads.length > 0;


  return (
    <li
     className={style['mutation-item']}
     data-unsequenced={isUnsequenced}>
      {text}
      {hasTotalReads || hasAAReads ? (
        <div className={style['annotations']}>
          {allAAReads && allAAReads.length > 0 ? (
            <ul
             data-hide-aa={allAAReads.length === 1}
             className={style['aa-percent-list']}>
              {orderBy(
                allAAReads, ['percent'], ['desc']
              ).map(({aminoAcid, percent}, idx) => (
                <li key={idx} className={style['aa-percent-item']}>
                  <span className={style['amino-acid']}>
                    {aminoAcid.replace('-', 'Δ')}{': '}
                  </span>
                  {formatPercent(percent)}
                </li>
              ))}
            </ul>
          ) : null}
          {totalReads && totalReads > 0 ? (
            <div className={style['total-reads']}>
              cov={totalReads.toLocaleString('en-US')}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export default Mutation;
