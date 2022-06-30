import React from 'react';

import useTabularReports from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';


function SequenceTabularReports(props) {
  const {config} = props;
  const processors = useProcessors({config, subOptions, subOptionProcessors});

  useTabularReports({
    ...props,
    subOptionProcessors: processors
  });
  return <>Downloading...</>;
}

SequenceTabularReports.propTypes = {
  ...useTabularReports.propTypes
};

export default SequenceTabularReports;
