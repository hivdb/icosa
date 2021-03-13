import React from 'react';
import PropTypes from 'prop-types';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import parentStyle from '../style.module.scss';


function SDRMButton({disableSDRMs, showSDRMs, toggleSDRMs}) {
  return <Button
   className={parentStyle.button}
   onClick={toggleSDRMs} disabled={disableSDRMs}>
    {showSDRMs ?
      <FaEyeSlash className={parentStyle['icon-before-text']} /> :
      <FaEye className={parentStyle['icon-before-text']} />} SDRMs
  </Button>;
}


function SDRMList({geneSeqs}) {
  return <>
    {geneSeqs.map((geneSeq, idx) => {
      const {gene: {name: gene}, sdrms} = geneSeq;
      return <React.Fragment key={idx}>
        <dt>{gene} SDRMs:</dt>
        <dd>
          {(
            sdrms.length > 0 ?
              sdrms.map(sdrm => sdrm.text).join(", ") :
              "None"
          )}
        </dd>
      </React.Fragment>;
    })}
  </>;
}


SDRMList.propTypes = {
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

export {SDRMButton, SDRMList};
