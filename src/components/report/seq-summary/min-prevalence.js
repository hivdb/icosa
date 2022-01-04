import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MinPrevalence.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.shape({
    seqReadsMinPrevalenceOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minPrevalence: PropTypes.number.isRequired,
  actualMinPrevalence: PropTypes.number.isRequired
};

function MinPrevalence({
  match,
  router,
  config: {seqReadsMinPrevalenceOptions: options},
  minPrevalence: curValue,
  actualMinPrevalence: actualValue
}) {

  return <>
    <dt className={style['has-dropdown']}>
      Mutation detection threshold:
    </dt>
    <dd className={style['has-dropdown']}>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
      <span className={style['dropdown-after']}>
        (actual: {actualValue === 1. ? '100%' : `≥${(actualValue *
        100).toPrecision(2)}%`})
      </span>
    </dd>
  </>;

  function handleChange({value: cutoff}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = cutoff;
    router.push(newLoc);
  }

}


export default React.memo(MinPrevalence);
