import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../loader';

import ConfigContext from '../../utils/config-context';
import createPersistedReducer from '../../utils/use-persisted-reducer';

import ReportSection from './report-section';

import References, {
  useAutoUpdate,
  ReferenceContext,
  useReference,
  LoadExternalRefData
} from '../references';

import style from './style.module.scss';

const useDisplayRefSection = createPersistedReducer(
  '--sierra-report-display-ref-section-opt'
);


RefContextWrapper.propTypes = {
  children: PropTypes.node
};

export function RefContextWrapper({children}) {
  const [config, loading] = ConfigContext.use();
  const {refDataLoader} = config || {};
  const refContext = useReference(refDataLoader);
  if (loading) {
    return <Loader inline />;
  }
  return <ReferenceContext.Provider value={refContext}>
    {children}
  </ReferenceContext.Provider>;
}

export default function ReferencesSection() {
  const [
    display,
    toggleDisplay
  ] = useDisplayRefSection(display => !display, false);

  const {
    hasAnyReference
  } = React.useContext(ReferenceContext);

  useAutoUpdate();

  if (hasAnyReference()) {
    return (
      <ReportSection
       title="References"
       display={display}
       className={style['reference-section']}
       toggleDisplay={toggleDisplay}
       collapsable>
        <LoadExternalRefData />
        <References />
      </ReportSection>
    );
  }
  return null;
}
