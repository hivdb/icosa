import React from 'react';

import useTabularReports from '../../../components//tabular-report/reports';
import {subOptionProcessors} from './sub-options';


function SeqReadsTabularReports(props) {
  useTabularReports({
    ...props,
    subOptionProcessors,
    zipName: 'NGS-analysis-reports.zip'
  });
  return <>
    Await for PANGO lineages...
  </>;
}

SeqReadsTabularReports.propTypes = {
  ...useTabularReports.propTypes
};

export default SeqReadsTabularReports;
