import React from 'react';

import ExtLink from '../../../link/external';

export interface HelpLinkProps {
  option: string;
  anchor: string;
}

export default function HelpLink({option, anchor}: HelpLinkProps) {
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
