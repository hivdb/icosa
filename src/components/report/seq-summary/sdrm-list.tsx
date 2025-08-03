import React from 'react';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import parentStyle from '../style.module.scss';

/** Properties for {@link SDRMButton}. */
export interface SDRMButtonProps {
  config: {displaySDRMs: string[] | boolean};
  disableSDRMs: boolean;
  showSDRMs?: boolean;
  toggleSDRMs?: () => void;
}

function SDRMButton({
  config: {displaySDRMs},
  disableSDRMs,
  showSDRMs,
  toggleSDRMs
}: SDRMButtonProps) {
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

/** Properties for {@link SDRMList}. */
export interface SDRMListProps {
  config: {displaySDRMs: string[] | boolean};
  geneSeqs?: Array<{
    gene: {name: string};
    sdrms: Array<{text: string}>;
  }>;
}

function SDRMList({geneSeqs = [], config: {displaySDRMs}}: SDRMListProps) {
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
