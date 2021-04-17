import React from 'react';

import style from './style.module.scss';


export default function Placeholder() {
  return (
    <div class={style['ph-item']}>
      <div class={style['ph-col-12']}>
        <div class={style['ph-picture']}></div>
        <div class={style['ph-row']}>
          <div class="ph-col-6 big"></div>
          <div class="ph-col-4 empty big"></div>
          <div class="ph-col-2 big"></div>
          <div class="ph-col-4"></div>
          <div class="ph-col-8 empty"></div>
          <div class="ph-col-6"></div>
          <div class="ph-col-6 empty"></div>
          <div class="ph-col-12"></div>
        </div>
      </div>
    </div>
  );
}
