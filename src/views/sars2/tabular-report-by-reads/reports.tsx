import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

/**
 * Trigger tabular report downloads for sequence read analyses.
 *
 * @param props - {@link UseTabularReportsProps} forwarded to the hook.
 * @returns A placeholder fragment shown during download.
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
