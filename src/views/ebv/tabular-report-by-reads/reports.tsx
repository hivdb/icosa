import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

/**
 * Trigger tabular report downloads for EBV read analyses.
 *
 * @param props - {@link UseTabularReportsProps} forwarded to the hook.
 * @returns Placeholder fragment while downloading.
 */
function SeqReadsTabularReports(props: UseTabularReportsProps) {
  useTabularReports({
    ...props,
    subOptionProcessors,
    zipName: 'NGS-analysis-reports.zip'
  });
  return <>Await for PANGO lineages...</>;
}

export default SeqReadsTabularReports;
