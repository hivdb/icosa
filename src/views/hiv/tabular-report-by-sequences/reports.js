import PropTypes from 'prop-types';

import useTabularReports from '../tabular-report/reports';
import {subOptionProcessors} from './sub-options';


function SequenceTabularReports(props) {
  return useTabularReports({...props, subOptionProcessors});
}

SequenceTabularReports.propTypes = {
  ...useTabularReports.propTypes,
  sequences: PropTypes.array.isRequired,
  sequenceAnalysis: PropTypes.array.isRequired,
};

export default SequenceTabularReports;
