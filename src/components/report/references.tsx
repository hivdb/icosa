import React from 'react';
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

const useDisplayRefSection = createPersistedReducer<boolean, void>(
  '--sierra-report-display-ref-section-opt'
);

export interface RefContextWrapperProps {
  /** Child elements to be wrapped by the reference context. */
  children?: React.ReactNode;
}

/**
 * Wraps children with a reference context loaded from configuration.
 *
 * @param props - Component properties.
 * @returns React element providing reference context or a loading indicator.
 */
export function RefContextWrapper({children}: RefContextWrapperProps) {
  const [config, loading] = ConfigContext.use();
  const {refDataLoader} = config || {};
  const refContext = useReference(refDataLoader);
  if (loading) {
    return <Loader inline />;
  }
  return (
    <ReferenceContext.Provider value={refContext}>
      {children}
    </ReferenceContext.Provider>
  );
}

/**
 * Displays the references section when at least one reference is available.
 *
 * @returns The rendered references section or `null` when no references exist.
 */
export default function ReferencesSection() {
  const [display, dispatchDisplay] = useDisplayRefSection(d => !d, false);
  const toggleDisplay = React.useCallback(
    () => dispatchDisplay(undefined as unknown as void),
    [dispatchDisplay]
  );

  const refContext = React.useContext(ReferenceContext);

  useAutoUpdate();

  if (refContext?.hasAnyReference()) {
    return (
      <ReportSection
        title="References"
        display={display}
        className={style['reference-section']}
        toggleDisplay={toggleDisplay}
        collapsable
      >
        <LoadExternalRefData />
        <References />
      </ReportSection>
    );
  }
  return null;
}
