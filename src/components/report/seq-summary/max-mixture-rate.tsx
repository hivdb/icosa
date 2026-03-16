import {useCallback, memo} from 'react';
import {useRouter} from 'found';
import Select from '../../select';
import type {SelectOption} from '../../select/types';
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
  if (typeof curValue !== 'number' || Number.isNaN(curValue)) {
    const queryValue = match.location.query.mixrate;
    const parsed =
      typeof queryValue === 'string' ? Number.parseFloat(queryValue) : NaN;
    curValue = Number.isNaN(parsed) ? defaultValue : parsed;
  }

  const selectOptions: SelectOption[] = options.map(({label, value}) => ({
    label,
    value: String(value)
  }));

  /**
   * Update router query with new maximum mixture rate threshold.
   *
   * @param option - Selected mixture rate option.
   */
  const handleChange = useCallback(
    (option: SelectOption | null) => {
      if (!option || !option.value) return;
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.mixrate = option.value;
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
      <Select
       inputId="max-mixture-rate"
       name="max-mixture-rate"
       classNamePrefix={style.select}
       value={selectOptions.find(({value}) => Number(value) === curValue) ?? null}
       placeholder="..."
       options={selectOptions}
       onChange={handleChange}
       isClearable={false}
       isSearchable={false}
       testId="max-mixture-rate-select" />
    </dd>
  </>;

}

export default memo(MaxMixtureRate);
