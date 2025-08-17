import React from 'react';

import useTabularReports, {
  UseTabularReportsProps
} from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';

interface SequenceTabularReportsProps extends UseTabularReportsProps {
  /** routing match information */
  match: any;
  /** configuration object */
  config: any;
}

/**
 * Trigger tabular report downloads for HIV sequence analyses.
 *
 * @param props - {@link SequenceTabularReportsProps} with routing and config data.
 * @returns Placeholder fragment while downloading.
 */
function SequenceTabularReports(props: SequenceTabularReportsProps) {
  const {config, match} = props;
  const processors = useProcessors({
    config,
    match,
    subOptions,
    subOptionProcessors
  });

  useTabularReports({
    ...props,
    subOptionProcessors: processors
  });
  return <>Downloading...</>;
}

export default SequenceTabularReports;
