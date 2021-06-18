import abSuscSummary from './antibodies';
import cpSuscSummary from './conv-plasma';
import vpSuscSummary from './vacc-plasma';


export default function suscSummary(props) {
  return [
    ...abSuscSummary(props),
    ...cpSuscSummary(props),
    ...vpSuscSummary(props)
  ];
}
