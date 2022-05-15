import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MaxMixtureRate.propTypes = {
  config: PropTypes.shape({
    seqReadsDefaultParams: PropTypes.shape({
      maxMixtureRate: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMaxMixtureRate: PropTypes.array.isRequired
  }),
  maxMixtureRate: PropTypes.number,
  mixtureRate: PropTypes.number
};


function MaxMixtureRate({
  config: {
    seqReadsDefaultParams: {
      maxMixtureRate: defaultValue
    },
    seqReadsMaxMixtureRate: options
  },
  maxMixtureRate: curValue,
  mixtureRate: actualValue
}) {
  const {match, router} = useRouter();
  if (isNaN(curValue)) {
    curValue = Number.parseFloat(match.location.query.mixrate);
    if (isNaN(curValue)) {
      curValue = defaultValue;
    }
  }

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
      {isNaN(actualValue) ?
        null : <span className={style['dropdown-after']}>
          (actual: {actualValue === 0. ? 0 : (actualValue *
        100).toPrecision(2)}%)
        </span>
      }
    </dd>
  </>;

}


export default MaxMixtureRate;
