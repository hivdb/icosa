import {memo, useCallback} from 'react';
import {useRouter} from 'found';
import Select from '../../select';
import type {SelectOption} from '../../select/types';

import style from './style.module.scss';

/**
 * Properties for the {@link MinCodonReads} component.
 */
export interface MinCodonReadsProps {
  config: {
    seqReadsDefaultParams: {minCodonReads: number};
    seqReadsMinCodonReadsOptions: Array<{label: string; value: number}>;
  };
  minCodonReads?: number | null;
}

/**
 * Render a dropdown for selecting the minimum codon reads threshold.
 *
 * @param props - {@link MinCodonReadsProps} defining options and value.
 * @returns Definition list entries with a dropdown component.
 */
function MinCodonReads({
  config: {
    seqReadsDefaultParams: {
      minCodonReads: defaultValue
    },
    seqReadsMinCodonReadsOptions: options
  },
  minCodonReads: curValue
}: MinCodonReadsProps) {
  const {match, router} = useRouter();
  if (curValue === null || Number.isNaN(curValue)) {
    const queryValue = match.location.query.cdreads;
    const parsed =
      typeof queryValue === 'string' ? Number.parseFloat(queryValue) : NaN;
    curValue = Number.isNaN(parsed) ? defaultValue : parsed;
  }

  const selectOptions: SelectOption[] = options.map(({label, value}) => ({
    label,
    value: String(value)
  }));

  /**
   * Update router query with new minimum codon reads threshold.
   *
   * @param option - Selected threshold option.
   */
  const handleChange = useCallback(
    (option: SelectOption | null) => {
      if (!option || !option.value) return;
      const newLoc = {...match.location};
      newLoc.query = newLoc.query ? newLoc.query : {};
      newLoc.query.cdreads = option.value;
      router.push(newLoc);
    },
    [match.location, router]
  );

  return <>
    <dt className={style['has-dropdown']}>
      Mutation occurrence threshold:
    </dt>
    <dd className={style['has-dropdown']}>
      <Select
       inputId="min-codon-reads"
       name="min-codon-reads"
       classNamePrefix={style.select}
       value={selectOptions.find(({value}) => Number(value) === curValue) ?? null}
       placeholder="..."
       options={selectOptions}
       onChange={handleChange}
       isClearable={false}
       isSearchable={false}
       testId="min-codon-reads-select" />
    </dd>
  </>;

}

export default memo(MinCodonReads);
