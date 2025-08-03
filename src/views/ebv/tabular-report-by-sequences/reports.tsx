import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

/**
 * Trigger tabular report downloads for EBV sequence analyses.
 *
 * @param props - {@link UseTabularReportsProps} passed to the hook.
 * @returns Placeholder fragment during download.
 */
function SequenceTabularReports(props: UseTabularReportsProps) {
  useTabularReports({...props, subOptionProcessors});
  return <>Await for PANGO lineages...</>;
}

export default SequenceTabularReports;
