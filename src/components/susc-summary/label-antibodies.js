import React from 'react';
import PropTypes from 'prop-types';

import {HoverPopup} from '../popup';
import Markdown from '../markdown';
import {ConfigContext} from '../report';

import {antibodyShape} from './prop-types';


LabelAntibodies.propTypes = {
  antibodies: PropTypes.arrayOf(antibodyShape.isRequired).isRequired
};

export default function LabelAntibodies({antibodies}) {
  const descMsg = `mab-desc_${
    antibodies.map(({name}) => name).join('+')
  }`;
  const [config] = ConfigContext.use();

  const message = config.messages[descMsg];

  return <HoverPopup message={
    message ? <Markdown escapehtml={false}>
      {message}
    </Markdown> : null
  }>
    {antibodies
      .map(({name, abbrName}) => abbrName || name)
      .join(' + ')}
  </HoverPopup>;
}
