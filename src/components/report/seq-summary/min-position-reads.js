import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MinPositionReads.propTypes = {
  config: PropTypes.shape({
    seqReadsDefaultParams: PropTypes.shape({
      minPositionReads: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMinPositionReadsOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minPositionReads: PropTypes.number.isRequired
};

function MinPositionReads({
  config: {
    seqReadsDefaultParams: {
      minPositionReads: defaultValue
    },
    seqReadsMinPositionReadsOptions: options
  },
  minPositionReads: curValue
}) {
  const {match, router} = useRouter();
  if (curValue === null || isNaN(curValue)) {
    curValue = Number.parseFloat(match.location.query.posreads);
    if (isNaN(curValue)) {
      curValue = defaultValue;
    }
  }

  const handleChange = React.useCallback(
    ({value: posreads}) => {
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.posreads = posreads;
      router.push(newLoc);
    },
    [match.location, router]
  );

  return <>
    <dt className={style['has-dropdown']}>
      Read depth threshold:
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

}

export default React.memo(MinPositionReads);
