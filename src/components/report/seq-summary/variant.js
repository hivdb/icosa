import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';


Variant.propTypes = {
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
      referenceCountry: PropTypes.string.isRequired,
      referenceYear: PropTypes.number.isRequired
    }).isRequired
  )
};


Variant.defaultProps = {
  subtypes: []
};


export default function Variant(props) {
  const [showVariantDetails, setShowVariantDetails] = useState(false);

  const {
    bestMatchingSubtype,
    subtypes
  } = props;
  const variantText = bestMatchingSubtype ?
    bestMatchingSubtype.display : null;
  const bestMatchingVnum = bestMatchingSubtype ?
    bestMatchingSubtype.referenceAccession : null;

  if (!variantText) {
    return null;
  }

  return [
    <dt key={0}>
      Spike Variant:
    </dt>,
    <dd key={1}>
      <a
       className={parentStyle['link-style']} href="#toggle-variant-details"
       onClick={toggleVariantDetails}>
        {showVariantDetails ?
          <FaRegMinusSquare
           title="Hide variant details"
           className={parentStyle['icon-before-text']} /> :
          <FaRegPlusSquare
           title="Show variant details"
           className={parentStyle['icon-before-text']} />}
      </a>
      {' '}{variantText}
      {showVariantDetails ?
        <ul className={style['subtype-details']}>
          {subtypes.map(
            ({
              displayWithoutDistance: displayVariant,
              subtype: {displayName: variant},
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
                {vnum}:{' '}
                {country} ({year});{' '}
                {displayVariant} (
                {displayVariant !== variant ? `${variant}, ` : null}
                {distPcnt})
                {vnum === bestMatchingVnum ? '; best match' : null}
              </li>
            )
          )}
        </ul> : null}
    </dd>
  ];

  function toggleVariantDetails(e) {
    e && e.preventDefault();
    setShowVariantDetails(!showVariantDetails);
  }

}
