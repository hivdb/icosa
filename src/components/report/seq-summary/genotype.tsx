import React, {useState} from 'react';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import Link from '../../link';
import ExtLink from '../../link/external';

import style from './style.module.scss';
import parentStyle from '../style.module.scss';

/**
 * Properties for the {@link Genotype} component.
 *
 * @param config - Application configuration providing message strings.
 * @param bestMatchingSubtype - The subtype that best matches the sequence.
 * @param subtypes - All subtype matches returned by the subtyping service.
 */
export interface GenotypeProps {
  config: {messages: Record<string, string>};
  bestMatchingSubtype?: {
    display: string;
    referenceAccession: string;
  };
  subtypes?: Array<{
    displayWithoutDistance: string;
    subtype?: {displayName: string};
    distancePcnt: string;
    referenceAccession: string;
    referenceCountry?: string;
    referenceYear?: number;
  }>;
}

/**
 * Display genotype information with optional detailed subtype information.
 * A toggle link allows expanding or collapsing the details list.
 *
 * @param props - {@link GenotypeProps} defining genotype data.
 * @returns Definition list entries or `null` if no genotype is available.
 */
export default function Genotype({
  config,
  bestMatchingSubtype,
  subtypes = []
}: GenotypeProps) {
  const [showGenotypeDetails, setShowGenotypeDetails] = useState(false);

  const genotypeText = bestMatchingSubtype ?
    bestMatchingSubtype.display : null;
  const bestMatchingVnum = bestMatchingSubtype ?
    bestMatchingSubtype.referenceAccession : null;

  if (!genotypeText) {
    return null;
  }
  const titleLink = config.messages['seqsummary-header-genotype-link'];
  const titleText = config.messages['seqsummary-header-genotype'] || 'Genotype';

  return [
    <dt key={0}>
      {titleLink ?
        <Link to={titleLink} linkStyle="help">{titleText}</Link> :
        titleText
      }:
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
              subtype: {displayName: genotype} = {},
              distancePcnt: distPcnt,
              referenceAccession: vnum,
              referenceCountry: country,
              referenceYear: year
            }, idx) => (
              <li
               key={idx} className={
                vnum === bestMatchingVnum ?
                  style['best-match'] : undefined
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

  /** Toggle the visibility of genotype details list. */
  function toggleGenotypeDetails(e?: React.MouseEvent<HTMLAnchorElement>) {
    e && e.preventDefault();
    setShowGenotypeDetails(!showGenotypeDetails);
  }

}

