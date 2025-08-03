import React from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';

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
  if (curValue === null || isNaN(curValue)) {
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
