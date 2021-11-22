import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MaxMixtureRate.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.shape({
    seqReadsMaxMixtureRate: PropTypes.number.isRequired
  }),
  maxMixtureRate: PropTypes.number.isRequired,
  mixtureRate: PropTypes.number.isRequired
};


function MaxMixtureRate({
  match,
  router,
  config: {seqReadsMaxMixtureRate: options},
  maxMixtureRate: curValue,
  mixtureRate: actualValue
}) {

  const handleChange = React.useCallback(
    ({value: mixrate}) => {
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.mixrate = mixrate;
      router.push(newLoc);
    },
    [match.location, router]
  );

  return <>
    <dt className={style['has-dropdown']}>
      Nucleotide mixture threshold:
    </dt>
    <dd className={style['has-dropdown']} data-wide-dropdown>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
      <span className={style['dropdown-after']}>
        (actual: {actualValue === 0. ? 0 : (actualValue *
        100).toPrecision(2)}%)
      </span>
    </dd>
  </>;

}


export default MaxMixtureRate;
