import React from 'react';

import Intro, {
  IntroHeader,
  IntroHeaderSupplement
} from '../../components/intro';
import Button from '../../components/button';
import {ConfigContext} from '../../components/report';
import {FaPrint} from '@react-icons/all-files/fa/FaPrint';


import style from './style.module.scss';


export default function PrintHeader({curAnalysis}) {

  let title = 'Sierra Analysis Report';
  const [config, isPending] = ConfigContext.use();

  if (!isPending) {
    title = config.messages[`${curAnalysis}-report-title`];
  }

  return <Intro>
    <IntroHeader>
      <h1>{title}</h1>
      <IntroHeaderSupplement>
        <Button
         onClick={window.print}
         className={style['print-btn']}
         btnSize="normal" btnStyle="primary">
          <FaPrint /> Print
        </Button>
      </IntroHeaderSupplement>
    </IntroHeader>
  </Intro>;
  
}
