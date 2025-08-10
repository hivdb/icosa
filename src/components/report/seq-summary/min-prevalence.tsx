import React from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';

/**
 * Properties for the {@link MinPrevalence} component.
 */
export interface MinPrevalenceProps {
  config: {
    messages: Record<string, string>;
    seqReadsDefaultParams: {minPrevalence: number};
    seqReadsMinPrevalenceOptions: Array<{label: string; value: number}>;
  };
  minPrevalence?: number;
}

/**
 * Render a dropdown allowing selection of the minimum prevalence threshold.
 *
 * @param props - {@link MinPrevalenceProps} providing options and value.
 * @returns Definition list entries containing a dropdown.
 */
function MinPrevalence({
  config: {
    messages,
    seqReadsDefaultParams: {
      minPrevalence: defaultValue
    },
    seqReadsMinPrevalenceOptions: options
  },
  minPrevalence: curValue
}: MinPrevalenceProps) {
  const {match, router} = useRouter();
  if (curValue === undefined) {
    curValue = Number.parseFloat(match.location.query.cutoff);
    if (isNaN(curValue)) {
      curValue = defaultValue;
    }
  }

  const dropdownOptions = React.useMemo(
    () => options.map(({label, value}) => ({label, value: String(value)})),
    [options]
  );

  const handleChange = React.useCallback(
    ({value: cutoff}: {value: string}) => {
      const numCutoff = parseFloat(cutoff);
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.cutoff = String(numCutoff);
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
       value={dropdownOptions.find(({value}) => Number(value) === curValue)}
       placeholder="..."
       options={dropdownOptions}
       onChange={handleChange}
      />
    </dd>
  </>;

}


export default React.memo(MinPrevalence);
