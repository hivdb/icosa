import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MinPrevalence.propTypes = {
  config: PropTypes.shape({
    seqReadsDefaultParams: PropTypes.shape({
      minPrevalence: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMinPrevalenceOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minPrevalence: PropTypes.number,
  actualMinPrevalence: PropTypes.number
};

function MinPrevalence({
  config: {
    seqReadsDefaultParams: {
      minPrevalence: defaultValue
    },
    seqReadsMinPrevalenceOptions: options
  },
  minPrevalence: curValue,
  actualMinPrevalence: actualValue
}) {
  const {match, router} = useRouter();
  if (curValue === undefined) {
    curValue = Number.parseFloat(match.location.query.cutoff);
    if (isNaN(curValue)) {
      curValue = defaultValue;
    }
  }

  const handleChange = React.useCallback(
    ({value: cutoff}) => {
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.cutoff = cutoff;
      router.push(newLoc);
    },
    [match.location, router]
  );

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
      {isNaN(actualValue) ?
        null : <span className={style['dropdown-after']}>
          (actual: {actualValue === 1. ? '100%' : `≥${(actualValue *
          100).toPrecision(2)}%`})
        </span>}
    </dd>
  </>;

}


export default React.memo(MinPrevalence);
