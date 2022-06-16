import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';


MinPositionReads.propTypes = {
  config: PropTypes.shape({
    messages: PropTypes.object.isRequired,
    seqReadsDefaultParams: PropTypes.shape({
      minPositionReads: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMinPositionReadsOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minPositionReads: PropTypes.number
};

function MinPositionReads({
  config: {
    messages,
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

  const [label, desc] = useMessages(
    [
      'min-position-reads-dropdown-label',
      'min-position-reads-dropdown-desc'
    ],
    messages
  );

  return <>
    <dt className={style['has-dropdown']}>
      <HoverPopup message={desc}>
        {label}:
      </HoverPopup>
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
