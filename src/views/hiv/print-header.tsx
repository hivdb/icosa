import React from 'react';
import Intro, {
  IntroHeader,
  IntroHeaderSupplement
} from '../../components/intro';
import Button from '../../components/button';
import {ConfigContext} from '../../components/report';
import {FaPrint} from '@react-icons/all-files/fa/FaPrint';


import style from './style.module.scss';
interface PrintHeaderProps {
  /** Identifier for the currently selected analysis */
  curAnalysis?: string;
}

/**
 * Header section rendered at the top of printable reports.
 *
 * @param props - {@link PrintHeaderProps}
 * @returns React element containing title and print button.
 */
export default function PrintHeader({ curAnalysis }: PrintHeaderProps): JSX.Element {
  let title = 'Sierra Analysis Report';

  const now = React.useMemo(() => new Date(), []);

  const [config, isPending] = ConfigContext.use();

  if (!isPending) {
    title = config.messages[`${curAnalysis}-report-title`] || title;
  }

  return (
    <Intro>
      <IntroHeader>
        <h1>{title}</h1>
        <IntroHeaderSupplement>
          <Button
            onClick={window.print}
            className={style['print-btn']}
            btnSize="normal"
            btnStyle="primary"
          >
            <FaPrint /> Print
          </Button>
        </IntroHeaderSupplement>
        <p>Generated at {now.toLocaleString()}</p>
      </IntroHeader>
    </Intro>
  );
}
