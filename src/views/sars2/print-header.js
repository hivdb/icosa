import React from 'react';
import PropTypes from 'prop-types';

import ConfigContext from '../../utils/config-context';

import Intro, {
  IntroHeader,
  IntroHeaderSupplement
} from '../../components/intro';
import Button from '../../components/button';
import {FaPrint} from '@react-icons/all-files/fa/FaPrint';


import style from './style.module.scss';


PrintHeader.propTypes = {
  curAnalysis: PropTypes.string.isRequired
};

export default function PrintHeader({curAnalysis}) {

  let title = 'Sierra Analysis Report';

  const now = React.useMemo(() => new Date(), []);

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
      <p>Generated at {now.toLocaleString()}</p>
    </IntroHeader>
  </Intro>;

}
