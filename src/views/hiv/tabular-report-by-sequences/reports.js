import React from 'react';
import {matchShape} from 'found';

import useTabularReports from '../../../components/tabular-report/reports';
import useProcessors from '../tabular-report/use-processors';
import {subOptions, subOptionProcessors} from './sub-options';


function SequenceTabularReports(props) {
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

SequenceTabularReports.propTypes = {
  match: matchShape.isRequired,
  ...useTabularReports.propTypes
};

export default SequenceTabularReports;
