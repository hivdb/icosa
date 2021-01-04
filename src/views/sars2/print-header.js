import React from 'react';

import Intro, {
  IntroHeader,
  IntroHeaderSupplement
} from '../../components/intro';
import Button from '../../components/button';
import {FaPrint} from '@react-icons/all-files/fa/FaPrint';


import style from './style.module.scss';


export default class PrintHeader extends React.Component {

  print = () => {
    window.print();
  }

  render() {
    return <Intro>
      <IntroHeader>
        <h1>HIVdb Program Report</h1>
        <IntroHeaderSupplement>
          <Button
           onClick={this.print}
           className={style['print-btn']}
           btnSize="normal" btnStyle="primary">
            <FaPrint /> Print
          </Button>
        </IntroHeaderSupplement>
        <p>Genotypic Resistance Interpretation Algorithm</p>
      </IntroHeader>
    </Intro>;
  }

}
