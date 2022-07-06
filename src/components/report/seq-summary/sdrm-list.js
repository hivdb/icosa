import React from 'react';
import PropTypes from 'prop-types';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import parentStyle from '../style.module.scss';

SDRMButton.propTypes = {
  config: PropTypes.shape({
    displaySDRMs: PropTypes.oneOfType(
      PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      PropTypes.bool.isRequired
    )
  }).isRequired,
  disableSDRMs: PropTypes.bool.isRequired,
  showSDRMs: PropTypes.bool,
  toggleSDRMs: PropTypes.func
};

function SDRMButton({
  config: {displaySDRMs},
  disableSDRMs,
  showSDRMs,
  toggleSDRMs
}) {
  return displaySDRMs &&
    (displaySDRMs === true || displaySDRMs.length > 0) ? (
      <Button
       className={parentStyle.button}
       onClick={toggleSDRMs} disabled={disableSDRMs}>
        {showSDRMs ?
          <FaEyeSlash className={parentStyle['icon-before-text']} /> :
          <FaEye className={parentStyle['icon-before-text']} />} SDRMs
      </Button>
    ) : null;
}


SDRMList.propTypes = {
  config: PropTypes.shape({
    displaySDRMs: PropTypes.oneOfType(
      PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      PropTypes.bool.isRequired
    )
  }).isRequired,
  geneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      sdrms: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  )
};

SDRMList.defaultProps = {geneSeqs: []};

function SDRMList({geneSeqs, config: {displaySDRMs}}) {
  return <>
    {displaySDRMs ? geneSeqs.map((geneSeq, idx) => {
      const {gene: {name: gene}, sdrms} = geneSeq;
      return displaySDRMs === true || displaySDRMs.includes(gene) ? (
        <React.Fragment key={idx}>
          <dt>{gene} SDRMs:</dt>
          <dd>
            {(
              sdrms.length > 0 ?
                sdrms.map(sdrm => sdrm.text).join(", ") :
                "None"
            )}
          </dd>
        </React.Fragment>
      ) : null;
    }) : null}
  </>;
}

export {SDRMButton, SDRMList};
