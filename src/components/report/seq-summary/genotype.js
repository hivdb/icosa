import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import ExtLink from '../../link/external';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';


Genotype.propTypes = {
  config: PropTypes.object.isRequired,
  bestMatchingSubtype: PropTypes.shape({
    display: PropTypes.string.isRequired,
    referenceAccession: PropTypes.string.isRequired
  }),
  subtypes: PropTypes.arrayOf(
    PropTypes.shape({
      displayWithoutDistance: PropTypes.string.isRequired,
      subtype: PropTypes.shape({
        displayName: PropTypes.string.isRequired
      }),
      distancePcnt: PropTypes.string.isRequired,
      referenceAccession: PropTypes.string.isRequired,
      referenceCountry: PropTypes.string,
      referenceYear: PropTypes.number
    }).isRequired
  )
};


Genotype.defaultProps = {
  subtypes: []
};


export default function Genotype(props) {
  const [showGenotypeDetails, setShowGenotypeDetails] = useState(false);

  const {
    config,
    bestMatchingSubtype,
    subtypes
  } = props;
  const genotypeText = bestMatchingSubtype ?
    bestMatchingSubtype.display : null;
  const bestMatchingVnum = bestMatchingSubtype ?
    bestMatchingSubtype.referenceAccession : null;

  if (!genotypeText) {
    return null;
  }

  return [
    <dt key={0}>
      {config.messages['seqsummary-header-genotype'] || 'Genotype'}:
    </dt>,
    <dd key={1}>
      <a
       className={parentStyle['link-style']} href="#toggle-genotype-details"
       onClick={toggleGenotypeDetails}>
        {showGenotypeDetails ?
          <FaRegMinusSquare
           title="Hide genotype details"
           className={parentStyle['icon-before-text']} /> :
          <FaRegPlusSquare
           title="Show genotype details"
           className={parentStyle['icon-before-text']} />}
      </a>
      {' '}{genotypeText}
      {showGenotypeDetails ?
        <ul className={style['subtype-details']}>
          {subtypes.map(
            ({
              displayWithoutDistance: displayGenotype,
              subtype: {displayName: genotype},
              distancePcnt: distPcnt,
              referenceAccession: vnum,
              referenceCountry: country,
              referenceYear: year
            }, idx) => (
              <li
               key={idx} className={
                vnum === bestMatchingVnum ?
                  style['best-match'] : null
              }>
                <ExtLink
                 href={vnum.startsWith('EPI_ISL_') ?
                   'https://www.epicov.org/epi3/' :
                   `https://www.ncbi.nlm.nih.gov/nuccore/${vnum}`}>
                  {vnum}
                </ExtLink>
                {': '}
                {country} ({year}){'; '}
                {displayGenotype} (
                {displayGenotype !== genotype ? `${genotype}, ` : null}
                {distPcnt})
                {vnum === bestMatchingVnum ? '; best match' : null}
              </li>
            )
          )}
        </ul> : null}
    </dd>
  ];

  function toggleGenotypeDetails(e) {
    e && e.preventDefault();
    setShowGenotypeDetails(!showGenotypeDetails);
  }

}
