import React from 'react';
import React from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';

/**
 * Properties for the {@link MaxMixtureRate} component.
 */
export interface MaxMixtureRateProps {
  config: {
    messages: Record<string, string>;
    seqReadsDefaultParams: {maxMixtureRate: number};
    seqReadsMaxMixtureRate: Array<{label: string; value: number}>;
  };
  maxMixtureRate?: number;
}

/**
 * Render a dropdown allowing users to select the maximum mixture rate
 * threshold for sequence reads.
 *
 * @param props - {@link MaxMixtureRateProps} configuring available options.
 * @returns Definition list entries with a dropdown for mixture rate.
 */
function MaxMixtureRate({
  config: {
    messages,
    seqReadsDefaultParams: {
      maxMixtureRate: defaultValue
    },
    seqReadsMaxMixtureRate: options
  },
  maxMixtureRate: curValue
}: MaxMixtureRateProps) {
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
