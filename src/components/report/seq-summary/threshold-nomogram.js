import React from 'react';
import PropTypes from 'prop-types';

import Nomogram, {CutoffKeyPoint} from '../../seqreads-threshold-nomogram';

import style from './style.module.scss';

NomogramContainer.propTypes = {
  cutoffKeyPoints: PropTypes.arrayOf(CutoffKeyPoint.isRequired).isRequired,
  maxMixtureRate: PropTypes.number.isRequired,
  minPrevalence: PropTypes.number.isRequired,
  mixtureRate: PropTypes.number.isRequired,
  actualMinPrevalence: PropTypes.number.isRequired
};


export default function NomogramContainer({
  cutoffKeyPoints,
  maxMixtureRate: mixtureRateThreshold,
  minPrevalence: minPrevalenceThreshold,
  mixtureRate: mixtureRateActual,
  actualMinPrevalence: minPrevalenceActual
}) {

  return <div className={style['threshold-nomogram']}>
    <Nomogram
     {...{
       cutoffKeyPoints,
       mixtureRateThreshold,
       minPrevalenceThreshold,
       mixtureRateActual,
       minPrevalenceActual
     }}
     width={1600}
     height={400}
    />
  </div>;

}
