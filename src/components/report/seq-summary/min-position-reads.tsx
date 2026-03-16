import {memo, useCallback, useMemo} from 'react';
import {useRouter} from 'found';
import Select from '../../select';
import type {SelectOption} from '../../select/types';
import {HoverPopup} from '../../popup';
import useMessages from '../../../utils/use-messages';

import style from './style.module.scss';

/**
 * Properties for the {@link MinPositionReads} component.
 */
export interface MinPositionReadsProps {
  config: {
    messages: Record<string, string>;
    seqReadsDefaultParams: {minPositionReads: number};
    seqReadsMinPositionReadsOptions: Array<{label: string; value: number}>;
  };
  minPositionReads?: number | null;
}

/**
 * Render a dropdown to adjust the minimum position reads threshold.
 *
 * @param props - {@link MinPositionReadsProps} providing options and value.
 * @returns Definition list entries containing a dropdown element.
 */
function MinPositionReads({
  config: {
    messages,
    seqReadsDefaultParams: {
      minPositionReads: defaultValue
    },
    seqReadsMinPositionReadsOptions: options
  },
  minPositionReads: curValue
}: MinPositionReadsProps) {
  const {match, router} = useRouter();
  if (typeof curValue !== 'number' || Number.isNaN(curValue)) {
    const queryValue = match.location.query.posreads;
    const parsed =
      typeof queryValue === 'string' ? Number(queryValue) : NaN;
    curValue = Number.isNaN(parsed) ? defaultValue : parsed;
  }

  const selectOptions: SelectOption[] = useMemo(
    () => options.map(({label, value}) => ({label, value: String(value)})),
    [options]
  );

  /**
   * Handle updates to the minimum position reads threshold.
   *
   * @param option - Selected read depth option.
   */
  const handleChange = useCallback(
    (option: SelectOption | null) => {
      if (!option || !option.value) return;
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.posreads = option.value;
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
      <Select
       inputId="min-position-reads"
       name="min-position-reads"
       classNamePrefix={style.select}
       value={selectOptions.find(({value}) => Number(value) === curValue) ?? null}
       placeholder="..."
       options={selectOptions}
       onChange={handleChange}
       isClearable={false}
       isSearchable={false}
       testId="min-position-reads-select"
      />
    </dd>
  </>;

}

export default memo(MinPositionReads);
