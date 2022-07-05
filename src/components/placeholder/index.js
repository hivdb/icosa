import React from 'react';

import style from './style.module.scss';


export default function Placeholder() {
  return (
    <div className={style['ph-item']}>
      <div className={style['ph-col-12']}>
        <div className={style['ph-picture']}></div>
        <div className={style['ph-row']}>
          <div className="ph-col-6 big"></div>
          <div className="ph-col-4 empty big"></div>
          <div className="ph-col-2 big"></div>
          <div className="ph-col-4"></div>
          <div className="ph-col-8 empty"></div>
          <div className="ph-col-6"></div>
          <div className="ph-col-6 empty"></div>
          <div className="ph-col-12"></div>
        </div>
      </div>
    </div>
  );
}
