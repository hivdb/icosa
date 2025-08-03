import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';

interface SeqReadsTabularReportsProps extends UseTabularReportsProps {
  match: any;
  config: any;
}

/**
 * Trigger tabular report downloads for HIV read analyses.
 *
 * @param props - {@link SeqReadsTabularReportsProps} containing routing and config data.
 * @returns Placeholder fragment while downloading.
 */
function SeqReadsTabularReports(props: SeqReadsTabularReportsProps) {
  const {config, match} = props;
  const processors = useProcessors({
    config,
    match,
    subOptions,
    subOptionProcessors
  });

  useTabularReports({
    ...props,
    subOptionProcessors: processors,
    zipName: 'NGS-analysis-reports.zip'
  });
  return <>Downloading...</>;
}

export default SeqReadsTabularReports;
