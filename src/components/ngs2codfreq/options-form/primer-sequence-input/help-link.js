import React from 'react';
import PropTypes from 'prop-types';

import ExtLink from '../../../link/external';


HelpLink.propTypes = {
  option: PropTypes.string.isRequired,
  anchor: PropTypes.string.isRequired
};

export default function HelpLink({option, anchor}) {
  return <>
    Cutadapt option "{option}".
    <br />
    Check {' '}
    <ExtLink
     href={
       "https://cutadapt.readthedocs.io/en/v4.1/guide.html" +
       anchor
     }>
      the documentation
    </ExtLink> for more information.
  </>;
}
