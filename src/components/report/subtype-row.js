import React from 'react';
import PropTypes from 'prop-types';
import {FaRegPlusSquare, FaRegMinusSquare} from 'react-icons/fa';

import Link from '../link';
import ExtLink from '../link/external';

import style from './style.module.scss';

const NUCCORE_PREFIX = 'https://www.ncbi.nlm.nih.gov/nuccore/';


export default class SubtypeRow extends React.Component {

  static propTypes = {
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
    ).isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      showSubtypeDetails: false
    };
  }

  toggleSubtypeDetails = (e) => {
    e && e.preventDefault();
    const showSubtypeDetails = !this.state.showSubtypeDetails;
    this.setState({showSubtypeDetails});
  }

  render() {
    const {
      bestMatchingSubtype,
      subtypes} = this.props;
    const subtypeText = bestMatchingSubtype ?
      bestMatchingSubtype.display : null;
    const bestMatchingVnum = bestMatchingSubtype ?
      bestMatchingSubtype.referenceAccession : null;
    const {showSubtypeDetails} = this.state;

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
         className={style['link-style']} href="#toggle-subtype-details"
         onClick={this.toggleSubtypeDetails}>
          {showSubtypeDetails ?
            <FaRegMinusSquare
             title="Hide subtype details"
             className={style['icon-before-text']} /> :
            <FaRegPlusSquare
             title="Show subtype details"
             className={style['icon-before-text']} />}
        </a>
        {' '}{subtypeText}
        {showSubtypeDetails ?
          <ul className={style['subtype-details']}>
            {subtypes.map(
              ({displayWithoutDistance: displaySubtype,
                subtype: {displayName: subtype},
                distancePcnt: distPcnt,
                referenceAccession: vnum,
                referenceCountry: country,
                referenceYear: year}, idx) => (
                  <li key={idx} className={
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
  }

}
