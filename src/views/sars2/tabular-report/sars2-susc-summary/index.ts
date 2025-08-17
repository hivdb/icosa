import abSuscSummary from './antibodies';
// import cpSuscSummary from './conv-plasma';
// import vpSuscSummary from './vacc-plasma';

interface Props {
  [key: string]: any;
}

/**
 * Aggregate susceptibility summary tables.
 */
export default function suscSummary(props: Props) {
  return [
    ...abSuscSummary(props)/*,
    ...cpSuscSummary(props),
    ...vpSuscSummary(props)*/
  ];
}
