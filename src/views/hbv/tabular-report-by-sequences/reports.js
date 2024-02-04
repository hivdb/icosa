import React from 'react';

import useTabularReports from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';


function SequenceTabularReports(props) {
  useTabularReports({...props, subOptionProcessors});
  return <>
    Await for PANGO lineages...
  </>;
}

SequenceTabularReports.propTypes = {
  ...useTabularReports.propTypes
};

export default SequenceTabularReports;
