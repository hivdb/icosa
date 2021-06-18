import PropTypes from 'prop-types';

import useTabularReports from '../tabular-report/reports';
import {subOptionProcessors} from './sub-options';


function SeqReadsTabularReports(props) {
  return useTabularReports({...props, subOptionProcessors});
}

SeqReadsTabularReports.propTypes = {
  ...useTabularReports.propTypes,
  allSequenceReads: PropTypes.array.isRequired,
  sequenceReadsAnalysis: PropTypes.array.isRequired
};

export default SeqReadsTabularReports;
