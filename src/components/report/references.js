import React from 'react';

import createPersistedReducer from '../../utils/use-persisted-reducer';

import ConfigContext from './config-context';
import ReportSection from './report-section';

import References, {
  ReferenceContext,
  ReferenceContextValue,
  LoadExternalRefData
} from '../references';

const useDisplayRefSection = createPersistedReducer(
  '--sierra-report-display-ref-section-opt'
);

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
  const [display, toggleDisplay] = useDisplayRefSection(
    display => !display, false
  );

  return (
    <ReferenceContext.Consumer>
      {({hasAnyReference}) => hasAnyReference() ?
        <ReportSection
         title="References"
         display={display}
         toggleDisplay={toggleDisplay}
         collapsable>
          <LoadExternalRefData />
          <References />
        </ReportSection> : null}
    </ReferenceContext.Consumer>
  );
}
