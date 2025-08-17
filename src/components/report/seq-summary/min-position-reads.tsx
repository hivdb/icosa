import {memo, useCallback, useMemo} from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';
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

  const dropdownOptions = useMemo(
    () => options.map(({label, value}) => ({label, value: String(value)})),
    [options]
  );

  /**
   * Handle updates to the minimum position reads threshold.
   *
   * @param value - Selected read depth as a string.
   */
  const handleChange = useCallback(
    ({value: posreads}: {value: string}) => {
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
       value={dropdownOptions.find(({value}) => Number(value) === curValue)}
       placeholder="..."
       options={dropdownOptions}
       onChange={handleChange}
      />
    </dd>
  </>;

}

export default memo(MinPositionReads);
