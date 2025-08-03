import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

/**
 * Trigger tabular report downloads for sequence analyses.
 *
 * @param props - {@link UseTabularReportsProps} forwarded to the underlying hook.
 * @returns A placeholder React fragment while the download happens.
 */
function SequenceTabularReports(props: UseTabularReportsProps) {
  useTabularReports({...props, subOptionProcessors});
  return <>Await for PANGO lineages...</>;
}

export default SequenceTabularReports;
