import React, {useState} from 'react';
import React, {useState} from 'react';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import Link from '../../link';
import ExtLink from '../../link/external';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';

const NUCCORE_PREFIX = 'https://www.ncbi.nlm.nih.gov/nuccore/';

/** Properties for the {@link Subtype} component. */
export interface SubtypeProps {
  bestMatchingSubtype?: {display: string; referenceAccession: string};
  subtypes?: Array<{
    displayWithoutDistance: string;
    subtype: {displayName: string};
    distancePcnt: string;
    referenceAccession: string;
    referenceCountry: string;
    referenceYear: number;
  }>;
}

/**
 * Display subtype information with optional detailed list of candidate
 * subtypes.
 *
 * @param props - {@link SubtypeProps} describing subtype results.
 * @returns Definition list entries or `null` when subtype is unavailable.
 */
function Subtype({bestMatchingSubtype, subtypes = []}: SubtypeProps) {
  const [showSubtypeDetails, setShowSubtypeDetails] = useState(false);
  const subtypeText = bestMatchingSubtype ?
    bestMatchingSubtype.display : null;
  const bestMatchingVnum = bestMatchingSubtype ?
    bestMatchingSubtype.referenceAccession : null;

  if (!subtypeText) {
    return null;
  }

  return [
    <dt key={0}>
      <Link to="/page/hiv-subtyper/" linkStyle="help">
        Subtype
      </Link>
      :
    </dt>,
    <dd key={1}>
      <a
       className={parentStyle['link-style']} href="#toggle-subtype-details"
       onClick={toggleSubtypeDetails}>
        {showSubtypeDetails ?
          <FaRegMinusSquare
           title="Hide subtype details"
           className={parentStyle['icon-before-text']} /> :
          <FaRegPlusSquare
           title="Show subtype details"
           className={parentStyle['icon-before-text']} />}
      </a>
      {' '}{subtypeText}
      {showSubtypeDetails ?
        <ul className={style['subtype-details']}>
          {subtypes.map(
            ({
              displayWithoutDistance: displaySubtype,
              subtype: {displayName: subtype},
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
                 title="Open corresponding Genbank page"
                 href={`${NUCCORE_PREFIX}${vnum}`}>
                  {vnum}
                </ExtLink>:{' '}
                {country} ({year});{' '}
                {displaySubtype} (
                {displaySubtype !== subtype ? `${subtype}, ` : null}
                {distPcnt})
                {vnum === bestMatchingVnum ? '; best match' : null}
              </li>
            )
          )}
        </ul> : null}
    </dd>
  ];

  function toggleSubtypeDetails(e) {
    e && e.preventDefault();
    setShowSubtypeDetails(!showSubtypeDetails);
  }

}

export default Subtype;
