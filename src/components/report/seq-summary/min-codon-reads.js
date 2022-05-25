import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


MinCodonReads.propTypes = {
  config: PropTypes.shape({
    seqReadsDefaultParams: PropTypes.shape({
      minCodonReads: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMinCodonReadsOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minCodonReads: PropTypes.number
};

function MinCodonReads({
  config: {
    seqReadsDefaultParams: {
      minCodonReads: defaultValue
    },
    seqReadsMinCodonReadsOptions: options
  },
  minCodonReads: curValue
}) {
  const {match, router} = useRouter();
  if (isNaN(curValue)) {
    curValue = Number.parseFloat(match.location.query.cdreads);
    if (isNaN(curValue)) {
      curValue = defaultValue;
    }
  }

  const handleChange = React.useCallback(
    ({value: cdreads}) => {
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.cdreads = cdreads;
      router.push(newLoc);
    },
    [match.location, router]
  );

  return <>
    <dt className={style['has-dropdown']}>
      Mutation occurrence threshold:
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

export default React.memo(MinCodonReads);
