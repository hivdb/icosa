import React from 'react';
import {matchShape} from 'found';

import useTabularReports from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';


function SeqReadsTabularReports(props) {
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

SeqReadsTabularReports.propTypes = {
  match: matchShape.isRequired,
  ...useTabularReports.propTypes
};

export default SeqReadsTabularReports;
