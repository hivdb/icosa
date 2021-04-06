import React from 'react';

import ConfigContext from './config-context';
import ReportSection from './report-section';

import References, {
  ReferenceContext,
  ReferenceContextValue,
  LoadExternalRefData
} from '../references';

export function RefContextWrapper({children}) {
  return <ConfigContext.Consumer>
    {({refDataLoader}) => {
      const refContext = new ReferenceContextValue(refDataLoader);
      return <ReferenceContext.Provider value={refContext}>
        {children}
      </ReferenceContext.Provider>;
    }}
  </ConfigContext.Consumer>;
}

export default function ReferencesSection() {
  return (
    <ReferenceContext.Consumer>
      {({hasAnyReference}) => hasAnyReference() ?
        <ReportSection title="References">
          <LoadExternalRefData />
          <References />
        </ReportSection> : null}
    </ReferenceContext.Consumer>
  );
}
