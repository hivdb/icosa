import React from 'react';
import Popup from 'reactjs-popup';

import Markdown from '../markdown';
import {ConfigContext} from '../report';

import style from './style.module.scss';


export default function LabelAntibodies({antibodies}) {
  const descMsg = `mab-description-${
    antibodies.map(({name}) => name).join('+').toLocaleLowerCase('en-US')
  }`;
  const [config, loading] = ConfigContext.use();

  const trigger = (
    antibodies
      .map(({name, abbrName}) => abbrName || name)
      .join(' + ')
  );
  const message = config.messages[descMsg];
  if (loading || !message) {
    return trigger;
  }
  else {
    return (
      <Popup
       on="hover"
       position={[
         'top center',
         'right center',
         'bottom center',
         'left center'
       ]}
       className={style['mab-popup']}
       closeOnDocumentClick
       keepTooltipInside
       repositionOnResize
       trigger={<span className={style['mab-popup-trigger']}>
         {trigger}
       </span>}>
        <Markdown escapeHtml={false}>
          {message}
        </Markdown>
      </Popup>
    );
  }
}