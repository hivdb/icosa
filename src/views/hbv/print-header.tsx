import React, {ReactElement} from 'react';

import ConfigContext from '../../utils/config-context';

import Intro, {
  IntroHeader,
  IntroHeaderSupplement
} from '../../components/intro';
import Button from '../../components/button';
import {FaPrint} from '@react-icons/all-files/fa/FaPrint';

import style from './style.module.scss';

interface PrintHeaderProps {
  /** Current analysis name to determine messages. */
  curAnalysis: string;
}

/**
 * Header displayed on printable reports with a print button.
 *
 * @param props - {@link PrintHeaderProps} including current analysis name.
 * @returns Rendered header section.
 */
export default function PrintHeader({curAnalysis}: PrintHeaderProps): ReactElement {

  let title = 'Sierra Analysis Report';

  const now = React.useMemo(() => new Date(), []);

  const [config, isPending] = ConfigContext.use();

  if (!isPending && config) {
    title = config.messages[`${curAnalysis}-report-title`] || title;
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

