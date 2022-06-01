import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';


MinPrevalence.propTypes = {
  config: PropTypes.shape({
    messages: PropTypes.object.isRequired,
    seqReadsDefaultParams: PropTypes.shape({
      minPrevalence: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMinPrevalenceOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  minPrevalence: PropTypes.number
};

function MinPrevalence({
  config: {
    messages,
    seqReadsDefaultParams: {
      minPrevalence: defaultValue
    },
    seqReadsMinPrevalenceOptions: options
  },
  minPrevalence: curValue
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

  const [label, desc] = useMessages(
    [
      'min-prevalence-dropdown-label',
      'min-prevalence-dropdown-desc'
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


export default React.memo(MinPrevalence);
