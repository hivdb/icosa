import React, {useState, MouseEvent} from 'react';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import Link from '../link';
import ExtLink from '../link/external';

import style from './style.module.scss';

const NUCCORE_PREFIX = 'https://www.ncbi.nlm.nih.gov/nuccore/';

/** Information describing the best matching subtype. */
interface BestMatchingSubtype {
  display: string;
  referenceAccession: string;
}

/** Detailed subtype entry. */
interface SubtypeDetail {
  displayWithoutDistance: string;
  subtype: { displayName: string };
  distancePcnt: string;
  referenceAccession: string;
  referenceCountry: string;
  referenceYear: number;
}

export interface SubtypeRowProps {
  bestMatchingSubtype?: BestMatchingSubtype;
  subtypes: SubtypeDetail[];
}

/**
 * SubtypeRow renders information about sequence subtypes. A summary is
 * always shown; clicking the toggle reveals a list with detailed subtype
 * information including distance, accession and origin.
 */
export default function SubtypeRow({
  bestMatchingSubtype,
  subtypes
}: SubtypeRowProps) {
  const [showSubtypeDetails, setShowSubtypeDetails] = useState(false);

  if (!bestMatchingSubtype) {
    return null;
  }

  const subtypeText = bestMatchingSubtype.display;
  const bestMatchingVnum = bestMatchingSubtype.referenceAccession;

  const toggleSubtypeDetails = (e?: MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    setShowSubtypeDetails(prev => !prev);
  };

  return [
    <dt key={0}>
      <Link to="/page/hiv-subtyper/" linkStyle="help">
        Subtype
      </Link>
      :
    </dt>,
    <dd key={1}>
      <a
        className={style['link-style']}
        href="#toggle-subtype-details"
        onClick={toggleSubtypeDetails}
      >
        {showSubtypeDetails ? (
          <FaRegMinusSquare
            title="Hide subtype details"
            className={style['icon-before-text']}
          />
        ) : (
          <FaRegPlusSquare
            title="Show subtype details"
            className={style['icon-before-text']}
          />
        )}
      </a>
      {' '}{subtypeText}
      {showSubtypeDetails ? (
        <ul className={style['subtype-details']}>
          {subtypes.map(({
            displayWithoutDistance: displaySubtype,
            subtype: {displayName: subtype},
            distancePcnt: distPcnt,
            referenceAccession: vnum,
            referenceCountry: country,
            referenceYear: year
          }, idx) => (
            <li
              key={idx}
              className={vnum === bestMatchingVnum ? style['best-match'] : undefined}
            >
              <ExtLink
                title="Open corresponding Genbank page"
                href={`${NUCCORE_PREFIX}${vnum}`}
              >
                {vnum}
              </ExtLink>:{' '}
              {country} ({year});{' '}
              {displaySubtype} (
              {displaySubtype !== subtype ? `${subtype}, ` : ''}
              {distPcnt})
              {vnum === bestMatchingVnum ? '; best match' : null}
            </li>
          ))}
        </ul>
      ) : null}
    </dd>
  ];
}
