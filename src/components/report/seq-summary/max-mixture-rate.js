import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';


MaxMixtureRate.propTypes = {
  config: PropTypes.shape({
    messages: PropTypes.object.isRequired,
    seqReadsDefaultParams: PropTypes.shape({
      maxMixtureRate: PropTypes.number.isRequired
    }).isRequired,
    seqReadsMaxMixtureRate: PropTypes.array.isRequired
  }),
  maxMixtureRate: PropTypes.number
};


function MaxMixtureRate({
  config: {
    messages,
    seqReadsDefaultParams: {
      maxMixtureRate: defaultValue
    },
    seqReadsMaxMixtureRate: options
  },
  maxMixtureRate: curValue
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

  const [label, desc] = useMessages(
    [
      'max-mixture-rate-dropdown-label',
      'max-mixture-rate-dropdown-desc'
    ],
    messages
  );

  return <>
    <dt className={style['has-dropdown']}>
      <HoverPopup message={desc}>
        {label}:
      </HoverPopup>
    </dt>
    <dd className={style['has-dropdown']} data-wide-dropdown>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
    </dd>
  </>;

}


export default MaxMixtureRate;
