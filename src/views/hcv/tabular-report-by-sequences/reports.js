import useTabularReports from '../../../components/tabular-report/reports';
import {subOptionProcessors} from './sub-options';

function HCVTabularReports(props) {
  useTabularReports({
    ...props,
    subOptionProcessors
  });
  return null;
}

HCVTabularReports.propTypes = {
  ...useTabularReports.propTypes
};

export default HCVTabularReports;
