import React from 'react';

import useTabularReports from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';


function SeqReadsTabularReports(props) {
  const {config} = props;
  const processors = useProcessors({config, subOptions, subOptionProcessors});

  useTabularReports({
    ...props,
    subOptionProcessors: processors,
    zipName: 'NGS-analysis-reports.zip'
  });
  return <>Downloading...</>;
}

SeqReadsTabularReports.propTypes = {
  ...useTabularReports.propTypes
};

export default SeqReadsTabularReports;
