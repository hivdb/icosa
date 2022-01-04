import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MinCodonReads.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.shape({
    seqReadsMinCodonReadsOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minCodonReads: PropTypes.number.isRequired
};

function MinCodonReads({
  match,
  router,
  config: {seqReadsMinCodonReadsOptions: options},
  minCodonReads: curValue
}) {

  return <>
    <dt className={style['has-dropdown']}>
      Read depth threshold by codon:
    </dt>
    <dd className={style['has-dropdown']}>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
    </dd>
  </>;

  function handleChange({value: cdreads}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cdreads = cdreads;
    router.push(newLoc);
  }

}

export default React.memo(MinCodonReads);
