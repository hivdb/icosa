import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

/**
 * Trigger tabular report downloads for HBV read analyses.
 *
 * @param props - {@link UseTabularReportsProps} forwarded to the hook.
 * @returns Placeholder fragment during download.
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
